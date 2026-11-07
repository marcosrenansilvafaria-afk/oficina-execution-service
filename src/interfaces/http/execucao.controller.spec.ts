import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExecucaoController } from './execucao.controller';
import { Execucao } from '../../domain/entities/execucao';
import { execucaoRepo } from '../../infraestructure/singletons';

describe('ExecucaoController', () => {
  let controller: ExecucaoController;

  beforeEach(async () => {
    controller = new ExecucaoController();
    await execucaoRepo.clear();
  });

  it('listar() retorna a fila mapeada para o DTO', async () => {
    await execucaoRepo.save(new Execucao('exec-1', 'os-1'));

    const result = await controller.listar();

    expect(result).toEqual([
      { id: 'exec-1', ordemServicoId: 'os-1', status: 'NA_FILA' },
    ]);
  });

  it('iniciar() inicia a execucao e retorna o DTO atualizado', async () => {
    await execucaoRepo.save(new Execucao('exec-1', 'os-1'));

    const result = await controller.iniciar('exec-1', { mecanicoId: 'mec-1' });

    expect(result.status).toBe('EM_EXECUCAO');
  });

  it('iniciar() lanca NotFoundException quando a execucao nao existe', async () => {
    await expect(controller.iniciar('inexistente', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('iniciar() lanca BadRequestException quando a transicao e invalida', async () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();
    await execucaoRepo.save(execucao);

    await expect(controller.iniciar('exec-1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('finalizar() finaliza a execucao e retorna o DTO atualizado', async () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();
    await execucaoRepo.save(execucao);

    const result = await controller.finalizar('exec-1');

    expect(result.status).toBe('CONCLUIDA');
  });

  it('finalizar() lanca NotFoundException quando a execucao nao existe', async () => {
    await expect(controller.finalizar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('falhar() registra a falha e retorna o DTO atualizado', async () => {
    const execucao = new Execucao('exec-1', 'os-1');
    execucao.iniciar();
    await execucaoRepo.save(execucao);

    const result = await controller.falhar('exec-1', {
      motivo: 'peca incompativel',
    });

    expect(result.status).toBe('CANCELADA');
  });

  it('falhar() lanca NotFoundException quando a execucao nao existe', async () => {
    await expect(
      controller.falhar('inexistente', { motivo: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
