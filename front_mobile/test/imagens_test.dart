import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter_test/flutter_test.dart';

// O Chrome usa o decodificador do navegador, que recusa AVIF (um AVIF com
// extensão .jpg já quebrou a Home). O tipo real vem dos primeiros bytes.
bool _comecaCom(List<int> bytes, List<int> assinatura) {
  if (bytes.length < assinatura.length) return false;
  for (var i = 0; i < assinatura.length; i++) {
    if (bytes[i] != assinatura[i]) return false;
  }
  return true;
}

void main() {
  final imagens = Directory('assets/images')
      .listSync()
      .whereType<File>()
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  test('a pasta de imagens não está vazia', () {
    expect(imagens, isNotEmpty);
  });

  for (final imagem in imagens) {
    final nome = imagem.uri.pathSegments.last;

    test('$nome é do tipo que a extensão diz', () {
      final bytes = imagem.readAsBytesSync();
      final extensao = nome.split('.').last.toLowerCase();

      switch (extensao) {
        case 'jpg' || 'jpeg':
          expect(_comecaCom(bytes, [0xFF, 0xD8, 0xFF]), isTrue, reason: 'não é JPEG');
        case 'png':
          expect(_comecaCom(bytes, [0x89, 0x50, 0x4E, 0x47]), isTrue, reason: 'não é PNG');
        default:
          fail('extensão não prevista: .$extensao');
      }
    });

    test('$nome decodifica no motor do Flutter', () async {
      final codec = await ui.instantiateImageCodec(imagem.readAsBytesSync());
      final quadro = await codec.getNextFrame();

      expect(quadro.image.width, greaterThan(0));
    });
  }
}
