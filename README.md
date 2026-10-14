# Salão Celeste · demonstração comercial

Site demonstrativo público: https://refreshmeat.github.io/salao-celeste-demo/

## Experimente

- **Cliente:** escolha serviço, profissional, data e horário. Confirme com nome e celular e consulte/cancele pela opção "Minhas reservas".
- **Junior/profissional:** abra "Experimente a agenda do Junior". Alterne profissionais e dias, crie encaixes, bloqueie e libere horários, conclua ou cancele atendimentos e veja o resumo dos próximos 7 dias.
- **Clube Celeste:** na seção de planos, simule uma adesão sem cobrança. O cartão de assinante aparecerá em "Minhas reservas" e o painel do profissional mostrará a assinatura.
- **Reiniciar demo:** no painel do profissional, botão "Reiniciar demo" para apagar os dados de demonstração **do navegador atual** após confirmação.

## Avisos importantes

1. É um protótipo de apresentação, não uma operação em produção. Nenhum agendamento enviado pelo site chega ao salão.
2. Reservas, bloqueios, contas e assinaturas são dados de teste armazenados em localStorage **apenas naquele navegador**. Não há backend compartilhado, autenticação segura, pagamento ou bloqueio entre dispositivos diferentes.
3. A equipe (exceto Junior), serviços, preços, horários de funcionamento, duração de atendimento e regras de planos ainda dependem de validação pelo salão.
4. A logomarca usada é a imagem pública de perfil do próprio Salão Celeste (Instagram), preservada sem recriação. Outras fotografias do salão ou dos profissionais não são usadas.
5. O catálogo e as opções do painel devem ser ajustados aos profissionais e serviços reais antes do lançamento.

## Caminho para operação real

- Banco de dados isolado com integridade transacional e restrição contra dois agendamentos para a mesma pessoa profissional/horário, também em concorrência.
- Cadastro de funcionários, vínculos com os serviços, duração, turnos e folgas individuais.
- Login separado e verificado para clientes, profissionais e administração; políticas de acesso adequadas.
- Página de confirmação, remarcação, cancelamento e lembretes.
- Assinaturas com provedor de pagamento, regras de utilização e controle antifraude. Sem prometer ilimitado sem política de reservas.
- Política de privacidade/LGPD, proteção do telefone, backup, auditoria e monitoramento.

## Desenvolvimento

HTML + CSS + JavaScript, sem dependências de produção. Projeto local:
C:\Users\RefreshMeat\SalaoCeleste

Hospedagem de demonstração via GitHub Pages, independente de o PC ficar ligado.
