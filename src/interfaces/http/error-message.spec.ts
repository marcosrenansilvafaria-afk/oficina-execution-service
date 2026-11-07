import { getErrorMessage } from './error-message';

describe('getErrorMessage', () => {
  it('retorna a mensagem quando o erro e uma instancia de Error', () => {
    expect(getErrorMessage(new Error('falha especifica'))).toBe(
      'falha especifica',
    );
  });

  it('retorna o proprio valor quando o erro e uma string', () => {
    expect(getErrorMessage('erro como string')).toBe('erro como string');
  });

  it('retorna "Erro desconhecido" para qualquer outro tipo', () => {
    expect(getErrorMessage({ codigo: 500 })).toBe('Erro desconhecido');
    expect(getErrorMessage(undefined)).toBe('Erro desconhecido');
  });
});
