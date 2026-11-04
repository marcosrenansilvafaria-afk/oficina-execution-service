# language: pt
Funcionalidade: Fila de producao e execucao do reparo via Saga

  Cenario: Fluxo feliz - fila, execucao e finalizacao
    Dado que o pagamento da ordem de servico "os-1" foi aprovado
    Quando o mecanico inicia a execucao
    Entao o status da execucao deve ser "EM_EXECUCAO"
    E o evento ExecucaoIniciadaEvent deve ter sido publicado
    Quando o mecanico finaliza a execucao
    Entao o status da execucao deve ser "CONCLUIDA"
    E o evento ExecucaoConcluidaEvent deve ter sido publicado

  Cenario: Falha tecnica durante o reparo aciona a compensacao
    Dado uma execucao em andamento para a ordem de servico "os-1"
    Quando o mecanico registra uma falha tecnica no reparo
    Entao o status da execucao deve ser "CANCELADA"
    E o evento CompensarOSEvent com origem "EXECUCAO" deve ter sido publicado
