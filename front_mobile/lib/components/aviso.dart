import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Aviso extends StatelessWidget {
  const Aviso.sucesso(this.texto, {super.key}) : cor = const Color(0xFF2E7D4F);
  const Aviso.erro(this.texto, {super.key}) : cor = const Color(0xFFB3261E);

  final String texto;
  final Color cor;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cor.withValues(alpha: 0.4)),
      ),
      child: Text(texto, style: GoogleFonts.dmSans(fontSize: 13, color: cor)),
    );
  }
}
