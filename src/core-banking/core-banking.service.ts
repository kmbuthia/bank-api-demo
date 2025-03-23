import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import {
  kycDataRequest,
  transactionDataRequest,
  transactionDummyResponse,
} from './soap-templates';
import { parseXMLtoJSON } from '../common/helpers';

const agent = new https.Agent({
  keepAlive: true,
});

@Injectable()
export class CoreBankingService {
  bankingAxiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.bankingAxiosInstance = axios.create({
      baseURL: this.configService.get('banking.url'),
      httpsAgent: agent,
      timeout: 60000, // 60 seconds
    });
  }

  async getKYC(customerNumber: number) {
    const requestData = kycDataRequest(customerNumber);
    let response = {
      data: {
        customerNumber,
        status: 'subscribed',
      },
    };
    if (this.configService.get('banking.enabled')) {
      response = await this.bankingAxiosInstance.post(
        '/service/customer',
        requestData,
        {
          headers: {
            Connection: 'Keep-Alive',
            'Content-Type': 'text/xml;charset=UTF-8',
            'Accept-Encoding': 'gzip,deflate',
            // NB. SOAPAction needed here for final implementation
          },
          auth: {
            username: this.configService.get('banking.auth.username'),
            password: this.configService.get('banking.auth.password'),
          },
        },
      );
      // Convert response to JSON
      const parsedData = parseXMLtoJSON(response.data.toString());
      return { data: parsedData };
    }
    return response.data;
  }

  async getTransactions(customerNumber: number) {
    const requestData = transactionDataRequest(customerNumber);
    let response = {
      data: transactionDummyResponse,
    };
    if (this.configService.get('banking.enabled')) {
      response = await this.bankingAxiosInstance.post(
        '/service/transaction-data',
        requestData,
        {
          headers: {
            Connection: 'Keep-Alive',
            'Content-Type': 'text/xml;charset=UTF-8',
            'Accept-Encoding': 'gzip,deflate',
            // NB. SOAPAction needed here for final implementation
          },
          auth: {
            username: this.configService.get('banking.auth.username'),
            password: this.configService.get('banking.auth.password'),
          },
        },
      );
      // Convert response to JSON
      const parsedData = parseXMLtoJSON(response.data.toString());
      return { data: parsedData };
    }
    return response.data;
  }
}
