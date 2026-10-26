import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/header_auventura.dart';
import '../services/sessao.dart';
import '../theme/cores.dart';

class MyPetPage extends StatelessWidget {
  const MyPetPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: const HeaderAuventura(),
      body: SafeArea(
        child: ListenableBuilder(
          listenable: sessao,
          builder: (context, _) {
            final usuario = sessao.usuario;
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _boasVindas(usuario?.nome ?? 'Tutor'),
                  const SizedBox(height: 16),
                  _info(Icons.person_outline, 'Nome', usuario?.nome ?? '—'),
                  _info(Icons.mail_outline, 'E-mail', usuario?.email ?? '—'),
                  const SizedBox(height: 8),
                  _status(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _boasVindas(String nome) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Cores.forest,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.pets, color: Cores.bark, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Olá, $nome!',
                  style: GoogleFonts.fraunces(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Seja bem-vindo(a) à sua Área do Tutor. Aqui você acompanha tudo sobre o seu pet.',
                  style: GoogleFonts.dmSans(
                    fontSize: 13,
                    height: 1.4,
                    color: Colors.white.withValues(alpha: 0.75),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _info(IconData icone, String titulo, String valor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Cores.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Cores.sand,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icone, color: Cores.forest),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titulo,
                  style: GoogleFonts.fraunces(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Cores.forest,
                  ),
                ),
                Text(
                  valor,
                  style: GoogleFonts.dmSans(fontSize: 13, color: Cores.muted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _status() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F3EC),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: const BoxDecoration(
              color: Color(0xFF2E7D4F),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Seu pet está aproveitando as atividades da AUventura Park!',
              style: GoogleFonts.dmSans(fontSize: 13, color: Cores.forest),
            ),
          ),
        ],
      ),
    );
  }
}
