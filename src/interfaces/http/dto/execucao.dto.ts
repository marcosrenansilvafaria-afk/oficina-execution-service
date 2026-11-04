import { ApiProperty } from '@nestjs/swagger';
import type { StatusExecucao } from '../../../domain/entities/execucao';

export class IniciarExecucaoDto {
  @ApiProperty({ required: false, example: 'mec-1' })
  mecanicoId?: string;
}

export class RegistrarFalhaDto {
  @ApiProperty({ example: 'Peça incompatível com o veículo' })
  motivo!: string;
}

export class ExecucaoResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ordemServicoId!: string;

  @ApiProperty({ enum: ['NA_FILA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA'] })
  status!: StatusExecucao;
}
