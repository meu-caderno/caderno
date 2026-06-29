export interface Cipher {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}

export interface KeyStore {
  load(): Promise<string | null>;
  save(key: string): Promise<void>;
}
