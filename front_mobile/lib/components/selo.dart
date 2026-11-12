import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Selo extends StatelessWidget {
  const Selo(this.texto, {super.key});

  final String texto;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF0E8),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        texto,
        style: GoogleFonts.dmSans(
          color: const Color(0xFFE8622A),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
        ),
      ),
    );
  }
}
