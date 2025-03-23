export const kycDataRequest = (customerNumber: number) =>
  `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://credable.io/cbs/customer">
   <soapenv:Header/>
   <soapenv:Body>
      <cus:CustomerRequest>
         <cus:customerNumber>${customerNumber}</cus:customerNumber>
      </cus:CustomerRequest>
   </soapenv:Body>
</soapenv:Envelope>
`
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><');
