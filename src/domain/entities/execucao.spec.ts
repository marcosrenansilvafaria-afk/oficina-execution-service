import { Execucao } from './execucao';

describe('Execucao', () => {
  it('deve iniciar com status NA_FILA', () => {
    const execucao = new Execucao('exec-1', 'os-1');

    expect(execucao.getStatus()).toBe('NA_FILA');
  });

  it('deve iniciar a execucao e guardar o mecanico responsavel', () => {
    const execucao = new Execucao('exec-1', 'os-1');

    execucao.iniciar('mec-1');

    expect(execucao.getStatus()).toBe('EM_EXECUCAO');
    expect(execucao.getMecanicoId()).toBe('mec-1');
    expect(execucao.getIniciadaEm()).toBeInstanceOf(Date);
  });

  it('deve finalizar uma execucao EM_EXECUCAO', () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();

    execucao.finalizar();

    expect(execucao.getStatus()).toBe('CONCLUIDA');
    expect(execucao.getConcluidaEm()).toBeInstanceOf(Date);
  });

  it('deve cancelar uma execucao NA_FILA', () => {
    const execucao = new Execucao('exec-1', 'os-1');

    execucao.cancelar();

    expect(execucao.getStatus()).toBe('CANCELADA');
  });

  it('deve cancelar uma execucao EM_EXECUCAO', () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();

    execucao.cancelar();

    expect(execucao.getStatus()).toBe('CANCELADA');
  });

  it('deve impedir iniciar uma execucao que nao esta NA_FILA', () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();

    expect(() => execucao.iniciar()).toThrow(
      'Só é possível iniciar uma execução que está NA_FILA',
    );
  });

  it('deve impedir finalizar uma execucao que nao esta EM_EXECUCAO', () => {
    const execucao = new Execucao('exec-1', 'os-1');

    expect(() => execucao.finalizar()).toThrow(
      'Só é possível finalizar uma execução EM_EXECUCAO',
    );
  });

  it('deve impedir cancelar uma execucao ja CONCLUIDA', () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();
    execucao.finalizar();

    expect(() => execucao.cancelar()).toThrow(
      'Não é possível cancelar uma execução já finalizada/cancelada',
    );
  });

  it('reconstitute deve restaurar o estado completo', () => {
    const entradaFilaEm = new Date('2026-01-01');
    const iniciadaEm = new Date('2026-01-02');

    const execucao = Execucao.reconstitute(
      'exec-1',
      'os-1',
      entradaFilaEm,
      'EM_EXECUCAO',
      'mec-1',
      iniciadaEm,
    );

    expect(execucao.getStatus()).toBe('EM_EXECUCAO');
    expect(execucao.getMecanicoId()).toBe('mec-1');
    expect(execucao.getIniciadaEm()).toBe(iniciadaEm);
  });
});
