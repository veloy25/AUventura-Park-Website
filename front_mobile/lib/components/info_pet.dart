import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/pet.dart';
import '../theme/cores.dart';

class InfoPet extends StatelessWidget {
  const InfoPet({super.key, required this.pet});

  final Pet pet;

  // O back guarda o id da vacina; na tela vai o nome legível.
  String _nomeDaVacina(String id) {
    for (final vacina in vacinasDisponiveis) {
      if (vacina.id == id) return vacina.label;
    }
    return id;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _chip('${pet.idade} ${pet.idade == 1 ? 'ano' : 'anos'}'),
            const SizedBox(width: 8),
            _chip('${pet.peso.toStringAsFixed(1)} kg'),
          ],
        ),
        if (pet.vacinas.isNotEmpty) ...[
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: pet.vacinas.map((vacina) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F3EC),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '✓ ${_nomeDaVacina(vacina)}',
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF2E7D4F),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ],
    );
  }

  Widget _chip(String texto) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Cores.sand.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        texto,
        style: GoogleFonts.dmSans(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Cores.forest,
        ),
      ),
    );
  }
}
