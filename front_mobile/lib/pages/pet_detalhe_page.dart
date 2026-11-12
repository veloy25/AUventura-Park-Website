import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/aviso.dart';
import '../components/barra_voltar.dart';
import '../components/card_agendamento.dart';
import '../components/info_pet.dart';
import '../models/agendamento.dart';
import '../models/pet.dart';
import '../services/agendamentos_service.dart';
import '../services/api_client.dart';
import '../services/sessao.dart';
import '../theme/cores.dart';

// Um pet do My Pet: os dados dele e os agendamentos, divididos em próximos e
// histórico. Só leitura: o cadastro do pet não é editável.
class PetDetalhePage extends StatefulWidget {
  const PetDetalhePage({super.key, required this.pet});

  final Pet pet;

  @override
  State<PetDetalhePage> createState() => _PetDetalhePageState();
}

class _PetDetalhePageState extends State<PetDetalhePage> {
  List<Agendamento> _agendamentos = [];
  bool _carregando = true;
  String? _erro;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    final token = sessao.token;
    if (token == null) {
      setState(() => _carregando = false);
      return;
    }

    setState(() {
      _carregando = true;
      _erro = null;
    });
    try {
      final agendamentos = await apiGetAgendamentos(token);
      if (!mounted) return;
      setState(() => _agendamentos = agendamentos);
    } on ApiException catch (e) {
      if (mounted) setState(() => _erro = e.mensagem);
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final divisao = separarAgendamentos(
      _agendamentos,
      widget.pet.nome,
      agora: DateTime.now(),
    );

    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: BarraVoltar(widget.pet.nome),
      body: SafeArea(
        child: RefreshIndicator(
          color: Cores.bark,
          backgroundColor: Colors.white,
          onRefresh: _carregar,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _cabecalho(),
                const SizedBox(height: 28),
                if (_erro != null) Aviso.erro(_erro!),
                if (_carregando)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(color: Cores.bark),
                    ),
                  )
                else if (_erro == null) ...[
                  _secao(
                    'Próximos agendamentos',
                    divisao.proximos,
                    vazio: 'Nenhum agendamento futuro.',
                  ),
                  const SizedBox(height: 28),
                  _secao(
                    'Histórico',
                    divisao.historico,
                    vazio: 'Ainda não há atendimentos anteriores.',
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _cabecalho() {
    final pet = widget.pet;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Cores.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Cores.sand,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Center(
                  child: Text('🐾', style: TextStyle(fontSize: 22)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      pet.nome,
                      style: GoogleFonts.fraunces(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Cores.forest,
                      ),
                    ),
                    Text(
                      pet.raca.isNotEmpty ? pet.raca : 'Sem raça definida',
                      style: GoogleFonts.dmSans(
                        fontSize: 13,
                        color: Cores.muted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          InfoPet(pet: pet),
        ],
      ),
    );
  }

  Widget _secao(
    String titulo,
    List<Agendamento> agendamentos, {
    required String vazio,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                titulo,
                style: GoogleFonts.fraunces(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Cores.forest,
                ),
              ),
            ),
            if (agendamentos.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Cores.forest.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${agendamentos.length}',
                  style: GoogleFonts.dmSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Cores.forest,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
        if (agendamentos.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: Cores.border),
            ),
            child: Text(
              vazio,
              textAlign: TextAlign.center,
              style: GoogleFonts.dmSans(fontSize: 13, color: Cores.muted),
            ),
          )
        else
          ...agendamentos.map((a) => CardAgendamento(agendamento: a)),
      ],
    );
  }
}
