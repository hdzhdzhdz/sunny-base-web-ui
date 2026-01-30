import JSEncrypt from 'jsencrypt'
import { globalConfig } from '../config'

export function getRsaData(val) {
  const encryptor = new JSEncrypt()
  const publicKey = globalConfig.publicKey || ''
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(val)
}
