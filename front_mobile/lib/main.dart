import 'package:flutter/material.dart';

void main() {
  runApp(const AuventuraApp());
}

class AuventuraApp extends StatelessWidget {
  const AuventuraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AUventura Park',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'AUventura Park',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Bem-vindo ao AUventura Park!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            const Text(
              'Um espaço pensado para cuidar, divertir e proporcionar bem-estar ao seu pet.',
              style: TextStyle(
                fontSize: 16,
              ),
            ),

            const SizedBox(height: 30),

            const Text(
              'Nossos serviços',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            serviceCard(
              icon: Icons.pets,
              title: 'Daycare',
              description:
                  'Diversão, socialização e acompanhamento para o seu pet.',
            ),

            serviceCard(
              icon: Icons.content_cut,
              title: 'Banho e Tosa',
              description:
                  'Cuidados de higiene e estética com conforto e segurança.',
            ),

            serviceCard(
              icon: Icons.home,
              title: 'Hospedagem',
              description:
                  'Um ambiente seguro e confortável para seu pet enquanto você estiver fora.',
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {},
                child: const Text('Conheça nossos serviços'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget serviceCard({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Icon(
              icon,
              size: 40,
            ),

            const SizedBox(width: 16),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 6),

                  Text(description),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}