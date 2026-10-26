import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/campo_form.dart';
import '../components/header_auventura.dart';
import '../components/selo.dart';
import '../models/depoimento.dart';
import '../services/api_client.dart';
import '../services/depoimentos_service.dart';
import '../theme/cores.dart';

class TestimonialsPage extends StatefulWidget {
  const TestimonialsPage({super.key});

  @override
  State<TestimonialsPage> createState() => _TestimonialsPageState();
}

class _TestimonialsPageState extends State<TestimonialsPage> {
  static const _erroCor = Color(0xFFB3261E);

  final _formKey = GlobalKey<FormState>();
  final _cachorro = TextEditingController();
  final _raca = TextEditingController();
  final _tutor = TextEditingController();
  final _comentario = TextEditingController();

  List<Depoimento> _depoimentos = [];
  bool _carregando = true;
  bool _enviando = false;
  bool _mostrarForm = false;
  String? _erro;
  String? _erroEnvio;

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  @override
  void dispose() {
    _cachorro.dispose();
    _raca.dispose();
    _tutor.dispose();
    _comentario.dispose();
    super.dispose();
  }

  Future<void> _carregar() async {
    setState(() {
      _carregando = true;
      _erro = null;
    });
    try {
      final lista = await apiGetDepoimentos();
      if (!mounted) return;
      setState(() => _depoimentos = lista);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erro = e.mensagem);
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _enviando = true;
      _erroEnvio = null;
    });
    try {
      await apiCreateDepoimento(
        nomeCachorro: _cachorro.text.trim(),
        nomeTutor: _tutor.text.trim(),
        raca: _raca.text.trim(),
        comentario: _comentario.text.trim(),
      );
      if (!mounted) return;
      _formKey.currentState!.reset();
      setState(() => _mostrarForm = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Depoimento enviado com sucesso!')),
      );
      await _carregar();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erroEnvio = e.mensagem);
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final semDados = _depoimentos.isEmpty;

    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: const HeaderAuventura(),
      body: SafeArea(
        child: RefreshIndicator(
          color: Cores.forest,
          onRefresh: _carregar,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
            children: [
              _cabecalho(),
              if (_mostrarForm) _formulario(),
              if (_erro != null) _erroCard(),
              if (_carregando && semDados && _erro == null) _carregandoView(),
              if (!_carregando && semDados && _erro == null) _vazio(),
              for (final depoimento in _depoimentos) _card(depoimento),
            ],
          ),
        ),
      ),
    );
  }

  Widget _cabecalho() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Selo('COMUNIDADE'),
          const SizedBox(height: 12),
          Text(
            'Depoimentos',
            style: GoogleFonts.fraunces(
              fontSize: 29,
              fontWeight: FontWeight.w900,
              color: Cores.forest,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Veja o que os tutores falam sobre a AUventura Park.',
            style: GoogleFonts.dmSans(fontSize: 14, color: Cores.muted),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: _mostrarForm
                ? OutlinedButton.icon(
                    onPressed: () => setState(() => _mostrarForm = false),
                    icon: const Icon(Icons.close),
                    label: const Text('Fechar'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Cores.forest,
                      side: const BorderSide(color: Cores.forest),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                  )
                : FilledButton.icon(
                    onPressed: () => setState(() => _mostrarForm = true),
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Deixar depoimento'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Cores.bark,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _formulario() {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: _cartao(),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Conte sua experiência',
              style: GoogleFonts.fraunces(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Cores.forest,
              ),
            ),
            const SizedBox(height: 16),
            CampoForm(
              controller: _cachorro,
              rotulo: 'Nome do cachorro',
              dica: 'Ex: Bolinha',
            ),
            CampoForm(
              controller: _raca,
              rotulo: 'Raça',
              dica: 'Ex: Golden Retriever',
            ),
            CampoForm(
              controller: _tutor,
              rotulo: 'Seu nome (tutor)',
              dica: 'Ex: Maria Silva',
            ),
            CampoForm(
              controller: _comentario,
              rotulo: 'Comentário',
              dica: 'Conte como foi a experiência do seu pet...',
              linhas: 4,
              limite: 1000,
            ),
            if (_erroEnvio != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  _erroEnvio!,
                  style: GoogleFonts.dmSans(fontSize: 13, color: _erroCor),
                ),
              ),
            FilledButton(
              onPressed: _enviando ? null : _enviar,
              style: FilledButton.styleFrom(
                backgroundColor: Cores.bark,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(28),
                ),
              ),
              child: _enviando
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Enviar depoimento'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card(Depoimento depoimento) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: _cartao(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Cores.sand,
                  shape: BoxShape.circle,
                  border: Border.all(color: Cores.forest, width: 2),
                ),
                child: const Text('🐶', style: TextStyle(fontSize: 20)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      depoimento.nomeCachorro,
                      style: GoogleFonts.fraunces(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Cores.forest,
                      ),
                    ),
                    Text(
                      '${depoimento.raca} · Tutor: ${depoimento.nomeTutor}',
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
          const SizedBox(height: 16),
          _citacao(depoimento.comentario),
          if (depoimento.criadoEm != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.calendar_today_outlined,
                  size: 13,
                  color: Cores.muted,
                ),
                const SizedBox(width: 6),
                Text(
                  _data(depoimento.criadoEm!),
                  style: GoogleFonts.dmSans(fontSize: 12, color: Cores.muted),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _citacao(String texto) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 24, 18, 16),
      decoration: BoxDecoration(
        color: Cores.cream,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -22,
            left: -6,
            child: Text(
              '"',
              style: GoogleFonts.fraunces(
                fontSize: 48,
                color: Cores.bark.withValues(alpha: 0.5),
              ),
            ),
          ),
          Text(
            texto,
            style: GoogleFonts.dmSans(
              fontSize: 14,
              height: 1.6,
              color: const Color(0xFF3D2B1F),
            ),
          ),
        ],
      ),
    );
  }

  Widget _carregandoView() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          const CircularProgressIndicator(color: Cores.forest),
          const SizedBox(height: 16),
          Text(
            'Carregando depoimentos...',
            style: GoogleFonts.dmSans(color: Cores.muted),
          ),
        ],
      ),
    );
  }

  Widget _vazio() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          const Text('🐾', style: TextStyle(fontSize: 56)),
          const SizedBox(height: 12),
          Text(
            'Ainda não há depoimentos. Seja o primeiro a contribuir!',
            textAlign: TextAlign.center,
            style: GoogleFonts.dmSans(color: Cores.muted),
          ),
        ],
      ),
    );
  }

  Widget _erroCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: _cartao(),
      child: Column(
        children: [
          const Icon(Icons.cloud_off_outlined, size: 36, color: Cores.muted),
          const SizedBox(height: 10),
          Text(
            _erro!,
            textAlign: TextAlign.center,
            style: GoogleFonts.dmSans(fontSize: 14, color: Cores.muted),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: _carregar,
            style: TextButton.styleFrom(foregroundColor: Cores.forest),
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  BoxDecoration _cartao() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: Cores.border),
    );
  }

  String _data(DateTime data) {
    final dia = data.day.toString().padLeft(2, '0');
    final mes = data.month.toString().padLeft(2, '0');
    return '$dia/$mes/${data.year}';
  }
}
