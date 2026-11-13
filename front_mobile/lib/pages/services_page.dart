import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/header_auventura.dart';
import '../components/selo.dart';
import '../models/servico_info.dart';
import '../theme/cores.dart';
import 'service_details_page.dart';

// Os agendamentos do tutor ficam no My Pet.
class ServicesPage extends StatelessWidget {
  const ServicesPage({super.key, this.loginParaAgendar});

  // Chamado com true antes de abrir o login pelo "Agendar" e com false
  // depois. A navegação usa isso para não pular para o My Pet ao entrar.
  final ValueChanged<bool>? loginParaAgendar;

  void _abrirDetalhes(BuildContext context, ServicoInfo servico) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ServiceDetailsPage(
          servico: servico,
          loginParaAgendar: loginParaAgendar,
        ),
      ),
    );
  }

  Future<void> _agendar(BuildContext context, ServicoInfo servico) {
    return abrirAgendamento(
      context,
      servico,
      loginParaAgendar: loginParaAgendar,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: const HeaderAuventura(),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _heroSection(),
              const SizedBox(height: 28),
              _catalogoServicos(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _heroSection() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Cores.forest,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Selo('Nossos Serviços'),
          const SizedBox(height: 14),
          Text(
            'O que podemos fazer pelo seu pet?',
            style: GoogleFonts.fraunces(
              fontSize: 26,
              height: 1.15,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Cuidado profissional com muito amor, carinho e infraestrutura de ponta. Escolha um serviço para ver detalhes e agendar.',
            style: GoogleFonts.dmSans(
              fontSize: 13,
              height: 1.45,
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _catalogoServicos(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Serviços Disponíveis',
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Cores.forest,
                ),
              ),
            ),
            Text(
              '${servicosDisponiveis.length} opções',
              style: GoogleFonts.dmSans(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Cores.bark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...servicosDisponiveis.map(
          (servico) => _cardServicoCatalogo(context, servico),
        ),
      ],
    );
  }

  Widget _cardServicoCatalogo(BuildContext context, ServicoInfo servico) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Cores.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _abrirDetalhes(context, servico),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 150,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      servico.imagemAsset,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Cores.sand,
                          child: Center(
                            child: Text(
                              servico.emoji,
                              style: const TextStyle(fontSize: 48),
                            ),
                          ),
                        );
                      },
                    ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.55),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              servico.emoji,
                              style: const TextStyle(fontSize: 13),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              servico.label,
                              style: GoogleFonts.dmSans(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Cores.forest,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      servico.label,
                      style: GoogleFonts.fraunces(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Cores.forest,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      servico.resumo,
                      style: GoogleFonts.dmSans(
                        fontSize: 13,
                        height: 1.4,
                        color: Cores.muted,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Ver detalhes →',
                            style: GoogleFonts.dmSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Cores.bark,
                            ),
                          ),
                        ),
                        FilledButton(
                          onPressed: () => _agendar(context, servico),
                          style: FilledButton.styleFrom(
                            backgroundColor: Cores.forest,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Text(
                            '🗓 Agendar',
                            style: GoogleFonts.dmSans(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
