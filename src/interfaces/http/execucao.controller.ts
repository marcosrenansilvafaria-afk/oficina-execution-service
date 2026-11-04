import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IniciarExecucao } from '../../application/use-cases/iniciar-execucao';
import { FinalizarExecucao } from '../../application/use-cases/finalizar-execucao';
import { RegistrarFalhaExecucao } from '../../application/use-cases/registrar-falha-execucao';
import {
  execucaoRepo,
  historicoRepo,
  sagaPublisher,
} from '../../infraestructure/singletons';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/roles.enum';
import {
  ExecucaoResponseDto,
  IniciarExecucaoDto,
  RegistrarFalhaDto,
} from './dto/execucao.dto';
import { getErrorMessage } from './error-message';

@Controller('execucoes')
@ApiTags('execucoes')
export class ExecucaoController {
  private readonly iniciarExecucao = new IniciarExecucao(
    execucaoRepo,
    historicoRepo,
    sagaPublisher,
  );
  private readonly finalizarExecucao = new FinalizarExecucao(
    execucaoRepo,
    historicoRepo,
    sagaPublisher,
  );
  private readonly registrarFalha = new RegistrarFalhaExecucao(
    execucaoRepo,
    historicoRepo,
    sagaPublisher,
  );

  @ApiOperation({ summary: 'Listar a fila de producao' })
  @ApiOkResponse({ type: [ExecucaoResponseDto] })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MECANICO)
  @Get()
  async listar(): Promise<ExecucaoResponseDto[]> {
    const execucoes = await execucaoRepo.listAll();
    return execucoes.map((execucao) => ({
      id: execucao.id,
      ordemServicoId: execucao.ordemServicoId,
      status: execucao.getStatus(),
    }));
  }

  @ApiOperation({ summary: 'Iniciar a execucao (reparo) de uma OS na fila' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: IniciarExecucaoDto })
  @ApiOkResponse({ type: ExecucaoResponseDto })
  @ApiNotFoundResponse({ description: 'Execução não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/iniciar')
  async iniciar(
    @Param('id') id: string,
    @Body() body: IniciarExecucaoDto,
  ): Promise<ExecucaoResponseDto> {
    try {
      const execucao = await this.iniciarExecucao.execute(id, body?.mecanicoId);
      return {
        id: execucao.id,
        ordemServicoId: execucao.ordemServicoId,
        status: execucao.getStatus(),
      };
    } catch (err: unknown) {
      if (getErrorMessage(err) === 'Execução não encontrada') {
        throw new NotFoundException(getErrorMessage(err));
      }
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({ summary: 'Finalizar a execucao (reparo concluido)' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: ExecucaoResponseDto })
  @ApiNotFoundResponse({ description: 'Execução não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/finalizar')
  async finalizar(@Param('id') id: string): Promise<ExecucaoResponseDto> {
    try {
      const execucao = await this.finalizarExecucao.execute(id);
      return {
        id: execucao.id,
        ordemServicoId: execucao.ordemServicoId,
        status: execucao.getStatus(),
      };
    } catch (err: unknown) {
      if (getErrorMessage(err) === 'Execução não encontrada') {
        throw new NotFoundException(getErrorMessage(err));
      }
      throw new BadRequestException(getErrorMessage(err));
    }
  }

  @ApiOperation({
    summary: 'Registrar falha tecnica no reparo (aciona compensacao do Saga)',
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: RegistrarFalhaDto })
  @ApiOkResponse({ type: ExecucaoResponseDto })
  @ApiNotFoundResponse({ description: 'Execução não encontrada' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MECANICO)
  @Post(':id/falhar')
  async falhar(
    @Param('id') id: string,
    @Body() body: RegistrarFalhaDto,
  ): Promise<ExecucaoResponseDto> {
    try {
      const execucao = await this.registrarFalha.execute(id, body.motivo);
      return {
        id: execucao.id,
        ordemServicoId: execucao.ordemServicoId,
        status: execucao.getStatus(),
      };
    } catch (err: unknown) {
      if (getErrorMessage(err) === 'Execução não encontrada') {
        throw new NotFoundException(getErrorMessage(err));
      }
      throw new BadRequestException(getErrorMessage(err));
    }
  }
}
