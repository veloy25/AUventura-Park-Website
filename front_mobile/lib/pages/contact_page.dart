import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/aviso.dart';
import '../components/campo_form.dart';
import '../components/header_auventura.dart';
import '../components/selo.dart';
import '../services/api_client.dart';
import '../services/contato_service.dart';
import '../theme/cores.dart';

class ContactPage extends StatefulWidget {
  const ContactPage({super.key});

  @override
  State<ContactPage> createState() => _ContactPageState();
}

class _ContactPageState extends State<ContactPage> {
  final _formKey = GlobalKey<FormState>();
  final _nome = TextEditingController();
  final _email = TextEditingController();
  final _telefone = TextEditingController();
  final _assunto = TextEditingController();
  final _mensagem = TextEditingController();

  bool _enviando = false;
  bool _enviado = false;
  String? _erro;

  @override
  void dispose() {
    _nome.dispose();
    _email.dispose();
    _telefone.dispose();
    _assunto.dispose();
    _mensagem.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _enviando = true;
      _enviado = false;
      _erro = null;
    });
    try {
      await apiCreateContato(
        nome: _nome.text.trim(),
        email: _email.text.trim(),
        telefone: _telefone.text.trim(),
        assunto: _assunto.text.trim(),
        mensagem: _mensagem.text.trim(),
      );
      if (!mounted) return;
      _formKey.currentState!.reset();
      setState(() => _enviado = true);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erro = e.mensagem);
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  // Quem volta a editar depois de enviar (ou de errar) não vê mais o aviso antigo.
  void _limparAviso() {
    if (_enviado || _erro != null) {
      setState(() {
        _enviado = false;
        _erro = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: const HeaderAuventura(),
      body: SafeArea(
        // Column (e não ListView) para todos os campos existirem sempre: o
        // Form só valida os campos que estão montados.
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _cabecalho(),
              _info(),
              const SizedBox(height: 24),
              _formulario(),
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
          const Selo('ATENDIMENTO'),
          const SizedBox(height: 12),
          Text(
            'Fale com a AUventura Park',
            style: GoogleFonts.fraunces(
              fontSize: 29,
              fontWeight: FontWeight.w900,
              color: Cores.forest,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tem alguma dúvida sobre nossos serviços, agendamentos ou cuidados com seu pet? Nossa equipe está pronta para ajudar você.',
            style: GoogleFonts.dmSans(fontSize: 14, height: 1.5, color: Cores.muted),
          ),
        ],
      ),
    );
  }

  Widget _info() {
    return Column(
      children: [
        _infoCard(Icons.phone_outlined, 'WhatsApp', '(11) 99999-9999'),
        _infoCard(Icons.mail_outline, 'E-mail', 'contato@auventurapark.com'),
        _infoCard(Icons.place_outlined, 'Localização', 'São Paulo - SP'),
        _infoCard(
          Icons.schedule_outlined,
          'Horário',
          'Segunda a sábado, das 8h às 18h',
        ),
      ],
    );
  }

  Widget _infoCard(IconData icone, String titulo, String valor) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _cartao(),
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

  Widget _formulario() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cartao(),
      child: Form(
        key: _formKey,
        onChanged: _limparAviso,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Envie uma mensagem',
              style: GoogleFonts.fraunces(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Cores.forest,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Conte para a gente como podemos ajudar no cuidado do seu melhor amigo.',
              style: GoogleFonts.dmSans(fontSize: 13, height: 1.5, color: Cores.muted),
            ),
            const SizedBox(height: 16),
            if (_enviado)
              const Aviso.sucesso(
                'Mensagem enviada com sucesso! Em breve entraremos em contato.',
              ),
            if (_erro != null) Aviso.erro(_erro!),
            CampoForm(
              controller: _nome,
              rotulo: 'Nome',
              dica: 'Seu nome',
              capitalizacao: TextCapitalization.words,
            ),
            CampoForm(
              controller: _email,
              rotulo: 'E-mail',
              dica: 'seuemail@email.com',
              limite: 150,
              teclado: TextInputType.emailAddress,
              capitalizacao: TextCapitalization.none,
              validar: validarEmail,
            ),
            CampoForm(
              controller: _telefone,
              rotulo: 'Telefone (opcional)',
              dica: '(11) 99999-9999',
              limite: 20,
              obrigatorio: false,
              teclado: TextInputType.phone,
            ),
            CampoForm(
              controller: _assunto,
              rotulo: 'Assunto',
              dica: 'Ex: dúvida sobre daycare',
              limite: 200,
            ),
            CampoForm(
              controller: _mensagem,
              rotulo: 'Mensagem',
              dica: 'Digite sua mensagem...',
              linhas: 4,
              limite: 1000,
            ),
            FilledButton.icon(
              onPressed: _enviando ? null : _enviar,
              icon: _enviando
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.pets),
              label: Text(_enviando ? 'Enviando...' : 'Enviar mensagem'),
              style: FilledButton.styleFrom(
                backgroundColor: Cores.bark,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(28),
                ),
              ),
            ),
          ],
        ),
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
}
