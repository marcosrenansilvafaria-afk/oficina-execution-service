import { HistoricoIntervencao } from './historico-intervencao';

describe('HistoricoIntervencao', () => {
  it('deve guardar os dados de uma intervencao', () => {
    const historico = new HistoricoIntervencao(
      'hist-1',
      'exec-1',
      'EM_EXECUCAO',
      'Iniciado pelo mecanico mec-1',
    );

    expect(historico.execucaoId).toBe('exec-1');
    expect(historico.status).toBe('EM_EXECUCAO');
    expect(historico.observacao).toBe('Iniciado pelo mecanico mec-1');
  });
});
