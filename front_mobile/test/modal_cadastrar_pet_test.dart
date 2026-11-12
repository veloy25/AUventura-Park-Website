import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:front_mobile/components/modal_cadastrar_pet.dart';
import 'package:front_mobile/models/pet.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  testWidgets('sugere raças enquanto digita e preenche ao tocar', (
    tester,
  ) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    tester.view.physicalSize = const Size(750, 1624);
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () => ModalCadastrarPet.abrir(context),
              child: const Text('abrir'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('abrir'));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextFormField, 'Raça'), 'bo');
    await tester.pump();

    // Como no site: só as raças que começam com o que foi digitado.
    expect(find.widgetWithText(ActionChip, 'Border Collie'), findsOneWidget);
    expect(find.widgetWithText(ActionChip, 'Boston Terrier'), findsOneWidget);
    expect(find.widgetWithText(ActionChip, 'Boxer'), findsOneWidget);
    expect(find.widgetWithText(ActionChip, 'Bichon Frisé'), findsNothing);

    await tester.tap(find.widgetWithText(ActionChip, 'Boxer'));
    await tester.pump();

    expect(find.byType(ActionChip), findsNothing);
    expect(find.widgetWithText(TextFormField, 'Boxer'), findsOneWidget);
  });

  testWidgets(
    'recusa nome de pet que o tutor já tem, ignorando maiúsculas e espaços',
    (tester) async {
      GoogleFonts.config.allowRuntimeFetching = false;
      tester.view.physicalSize = const Size(750, 1624);
      tester.view.devicePixelRatio = 2;
      addTearDown(tester.view.reset);

      const thor = Pet(
        id: 7,
        userId: 1,
        nome: 'Thor',
        idade: 3,
        peso: 12.5,
        raca: 'Beagle',
      );
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () =>
                    ModalCadastrarPet.abrir(context, pets: const [thor]),
                child: const Text('abrir'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('abrir'));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Nome do pet'),
        '  tHOR ',
      );
      await tester.tap(find.text('Cadastrar Pet'));
      await tester.pump();

      expect(find.text('Você já tem um pet com esse nome'), findsOneWidget);
    },
  );

  testWidgets('aceita um nome que o tutor ainda não usou', (tester) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    tester.view.physicalSize = const Size(750, 1624);
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);

    const thor = Pet(
      id: 7,
      userId: 1,
      nome: 'Thor',
      idade: 3,
      peso: 12.5,
      raca: 'Beagle',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () =>
                  ModalCadastrarPet.abrir(context, pets: const [thor]),
              child: const Text('abrir'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('abrir'));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Nome do pet'),
      'Mel',
    );
    await tester.tap(find.text('Cadastrar Pet'));
    await tester.pump();

    expect(find.text('Você já tem um pet com esse nome'), findsNothing);
  });
}
