import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/aviso.dart';
import '../components/campo_form.dart';
import '../components/selo.dart';
import '../config/conta_teste.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/sessao.dart';
import '../theme/cores.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _nome = TextEditingController();
  final _email = TextEditingController();
  final _senha = TextEditingController();

  bool _cadastro = false;
  bool _carregando = false;
  String? _erro;
  String? _sucesso;

  @override
  void initState() {
    super.initState();
    if (kDebugMode) {
      _nome.text = ContaTeste.nome;
      _email.text = ContaTeste.email;
      _senha.text = ContaTeste.senha;
    }
  }

  @override
  void dispose() {
    _nome.dispose();
    _email.dispose();
    _senha.dispose();
    super.dispose();
  }

  void _trocarModo() {
    setState(() {
      _cadastro = !_cadastro;
      _erro = null;
      _sucesso = null;
    });
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _carregando = true;
      _erro = null;
      _sucesso = null;
    });
    try {
      if (_cadastro) {
        await apiSignup(_nome.text.trim(), _email.text.trim(), _senha.text);
        if (!mounted) return;
        // E-mail e senha ficam preenchidos: falta só tocar em "Entrar".
        setState(() {
          _cadastro = false;
          _sucesso = 'Conta criada com sucesso. Faça login para continuar.';
        });
      } else {
        final login = await apiLogin(_email.text.trim(), _senha.text);
        await sessao.entrar(login.token, login.usuario);
        if (!mounted) return;
        Navigator.of(context).pop();
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erro = e.mensagem);
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Cores.cream,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0.5,
        foregroundColor: Cores.forest,
        title: Text(
          'Área do Tutor',
          style: GoogleFonts.fraunces(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Cores.forest,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 38),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _boasVindas(),
              const SizedBox(height: 20),
              _formulario(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _boasVindas() {
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
                  'Bem-vindo de volta!',
                  style: GoogleFonts.fraunces(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Acesse sua área do tutor e acompanhe cada momento do seu pet.',
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

  Widget _formulario() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Cores.border),
      ),
      child: AutofillGroup(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Selo(_cadastro ? 'CADASTRO' : 'LOGIN'),
              ),
              const SizedBox(height: 12),
              Text(
                _cadastro ? 'Crie sua conta' : 'Entre na sua conta',
                style: GoogleFonts.fraunces(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Cores.forest,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _cadastro
                    ? 'Crie sua conta para acompanhar seu pet na AUventura Park.'
                    : 'Entre para acessar a Área do Tutor.',
                style: GoogleFonts.dmSans(fontSize: 13, color: Cores.muted),
              ),
              const SizedBox(height: 16),
              if (_erro != null) Aviso.erro(_erro!),
              if (_sucesso != null) Aviso.sucesso(_sucesso!),
              if (_cadastro)
                CampoForm(
                  controller: _nome,
                  rotulo: 'Nome',
                  dica: 'Seu nome completo',
                  capitalizacao: TextCapitalization.words,
                  autofill: const [AutofillHints.name],
                ),
              CampoForm(
                controller: _email,
                rotulo: 'E-mail',
                dica: 'seu@email.com',
                limite: 150,
                teclado: TextInputType.emailAddress,
                capitalizacao: TextCapitalization.none,
                validar: validarEmail,
                autofill: const [AutofillHints.email],
              ),
              CampoForm(
                controller: _senha,
                rotulo: 'Senha',
                dica: '••••••••',
                limite: 72,
                senha: true,
                capitalizacao: TextCapitalization.none,
                autofill: [
                  _cadastro ? AutofillHints.newPassword : AutofillHints.password,
                ],
              ),
              const SizedBox(height: 4),
              FilledButton(
                onPressed: _carregando ? null : _enviar,
                style: FilledButton.styleFrom(
                  backgroundColor: Cores.bark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                ),
                child: _carregando
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(_cadastro ? 'Criar conta' : 'Entrar'),
              ),
              const SizedBox(height: 10),
              Wrap(
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    _cadastro ? 'Já tem uma conta?' : 'Ainda não tem conta?',
                    style: GoogleFonts.dmSans(fontSize: 13, color: Cores.muted),
                  ),
                  TextButton(
                    onPressed: _carregando ? null : _trocarModo,
                    style: TextButton.styleFrom(foregroundColor: Cores.forest),
                    child: Text(_cadastro ? 'Fazer login' : 'Criar cadastro'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
