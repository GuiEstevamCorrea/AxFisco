export interface SefazService {
  authorizeNFe(xml: string): Promise<SefazResponse>;
  cancelNFe(accessKey: string, reason: string): Promise<SefazResponse>;
  queryNFeStatus(accessKey: string): Promise<SefazResponse>;
}

export interface NFSeService {
  authorizeNFSe(xml: string): Promise<NFSeResponse>;
  cancelNFSe(number: string, verificationCode: string, reason: string): Promise<NFSeResponse>;
  queryNFSeStatus(number: string): Promise<NFSeResponse>;
}

export interface SefazResponse {
  success: boolean;
  protocolNumber?: string;
  message: string;
  xmlResponse?: string;
  errors?: string[];
}

export interface NFSeResponse {
  success: boolean;
  number?: string;
  verificationCode?: string;
  message: string;
  xmlResponse?: string;
  errors?: string[];
}
