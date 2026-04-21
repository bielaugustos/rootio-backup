export async function isWebAuthnAvailable(): Promise<boolean> {
  return !!(window.navigator.credentials && window.navigator.credentials.get)
}

export function verifyPin(pin: string): boolean {
  // Implementar lógica de verificação de PIN
  // Por enquanto aceita qualquer PIN de 4 dígitos
  return pin.length === 4
}

export function hasPin(): boolean {
  // Implementar lógica para verificar se há PIN configurado
  return false
}