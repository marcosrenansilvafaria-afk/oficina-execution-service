import { InMemoryExecucaoRepository } from '../../infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../infraestructure/in-memory-historico-intervencao-repository';
import { EntrarNaFila } from './entrar-na-fila';

describe('EntrarNaFila', () => {
  it('deve criar uma execucao NA_FILA para a ordem de servico', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const useCase = new EntrarNaFila(execucaoRepo, historicoRepo);

    const execucao = await useCase.execute('os-1');

    expect(execucao.ordemServicoId).toBe('os-1');
    expect(execucao.getStatus()).toBe('NA_FILA');
  });

  it('deve ser idempotente quando o evento chega duplicado', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const useCase = new EntrarNaFila(execucaoRepo, historicoRepo);

    const primeira = await useCase.execute('os-1');
    const segunda = await useCase.execute('os-1');

    expect(segunda.id).toBe(primeira.id);
    expect(await execucaoRepo.listAll()).toHaveLength(1);
  });
});
