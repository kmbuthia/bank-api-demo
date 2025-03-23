import * as parser from 'xml2json';

export const parseXMLtoJSON = (data: string | undefined) => {
  try {
    return parser.toJson(data, {
      object: true,
      trim: true,
      sanitize: true,
      coerce: true,
    });
  } catch {
    return data;
  }
};

export const parseJSONtoXML = (
  data: { [key: string]: unknown } | undefined,
) => {
  try {
    return parser.toXml(data);
  } catch {
    return data;
  }
};
