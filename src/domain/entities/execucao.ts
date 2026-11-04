export type StatusExecucao =
  'NA_FILA' | 'EM_EXECUCAO' | 'CONCLUIDA' | 'CANCELADA';

/**
 * Maquina de estados da execucao (reparo) de uma Ordem de Servico na fila
 * de producao:
 *
 *   NA_FILA --iniciar--> EM_EXECUCAO --finalizar--> CONCLUIDA
 *   NA_FILA|EM_EXECUCAO --cancelar--> CANCELADA (compensacao do Saga)
 */
export class Execucao {
  private status: StatusExecucao;
  private mecanicoId?: string;
  private iniciadaEm?: Date;
  private concluidaEm?: Date;

  constructor(
    public readonly id: string,
    public readonly ordemServicoId: string,
    public readonly entradaFilaEm: Date = new Date(),
  ) {
    this.status = 'NA_FILA';
  }

  iniciar(mecanicoId?: string) {
    if (this.status !== 'NA_FILA') {
      throw new Error('Só é possível iniciar uma execução que está NA_FILA');
    }
    this.status = 'EM_EXECUCAO';
    this.mecanicoId = mecanicoId;
    this.iniciadaEm = new Date();
  }

  finalizar() {
    if (this.status !== 'EM_EXECUCAO') {
      throw new Error('Só é possível finalizar uma execução EM_EXECUCAO');
    }
    this.status = 'CONCLUIDA';
    this.concluidaEm = new Date();
  }

  cancelar() {
    if (this.status === 'CONCLUIDA' || this.status === 'CANCELADA') {
      throw new Error(
        'Não é possível cancelar uma execução já finalizada/cancelada',
      );
    }
    this.status = 'CANCELADA';
  }

  static reconstitute(
    id: string,
    ordemServicoId: string,
    entradaFilaEm: Date,
    status: StatusExecucao,
    mecanicoId?: string,
    iniciadaEm?: Date,
    concluidaEm?: Date,
  ): Execucao {
    const execucao = new Execucao(id, ordemServicoId, entradaFilaEm);
    execucao.status = status;
    execucao.mecanicoId = mecanicoId;
    execucao.iniciadaEm = iniciadaEm;
    execucao.concluidaEm = concluidaEm;
    return execucao;
  }

  getStatus() {
    return this.status;
  }

  getMecanicoId() {
    return this.mecanicoId;
  }

  getIniciadaEm() {
    return this.iniciadaEm;
  }

  getConcluidaEm() {
    return this.concluidaEm;
  }
}
