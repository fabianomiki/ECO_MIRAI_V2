#!/usr/bin/perl
# Servidor estatico de desenvolvimento — alternativa ao server.js para esta
# maquina, que nao tem Node instalado. O Perl vem junto com o Git for Windows.
# Uso: perl .claude/dev-server.pl [porta]
# Serve a pasta pai deste script (a raiz do site). Nao vai para producao.
use strict;
use warnings;
use IO::Socket::INET;
use FindBin qw($RealBin);

my $ROOT = $RealBin;
$ROOT =~ s{\\}{/}g;
$ROOT =~ s{/\.claude/?$}{};          # sobe de .claude/ para a raiz do site
my $PORT = $ARGV[0] || 4321;

my %TYPES = (
  html => 'text/html; charset=utf-8',
  css  => 'text/css; charset=utf-8',
  js   => 'text/javascript; charset=utf-8',
  svg  => 'image/svg+xml',
  jpg  => 'image/jpeg',
  jpeg => 'image/jpeg',
  png  => 'image/png',
  webp => 'image/webp',
  ico  => 'image/x-icon',
  json => 'application/json',
);

$| = 1;

my $srv = IO::Socket::INET->new(
  LocalAddr => '127.0.0.1',
  LocalPort => $PORT,
  Proto     => 'tcp',
  Listen    => 64,
  ReuseAddr => 1,
) or die "Nao foi possivel abrir a porta $PORT: $!\n";

print "Eco Mirai (perl) -> http://localhost:$PORT\n";
print "Servindo: $ROOT\n";

sub send_response {
  my ($c, $status, $type, $body) = @_;
  my $len = length $body;
  print $c "HTTP/1.1 $status\r\n"
         . "Content-Type: $type\r\n"
         . "Content-Length: $len\r\n"
         . "Cache-Control: no-store\r\n"
         . "X-Content-Type-Options: nosniff\r\n"
         . "Connection: close\r\n\r\n";
  print $c $body;
}

$SIG{CHLD} = 'IGNORE';   # colhe os filhos automaticamente

while (1) {
  my $c = $srv->accept;
  next unless $c;        # accept interrompido por sinal

  # Um processo por conexao: o navegador abre varias conexoes em paralelo e
  # algumas ficam ociosas sem enviar requisicao. Sem o fork, a leitura de uma
  # conexao ociosa trava o servidor inteiro e a pagina nunca termina de carregar.
  my $pid = fork();
  if (!defined $pid) { close $c; next; }
  if ($pid) { close $c; next; }        # pai volta a aceitar

  close $srv;                          # filho nao precisa do socket de escuta
  binmode $c;
  $c->autoflush(1);

  # Rede de seguranca: conexao ociosa nao segura o processo filho para sempre
  eval { $c->timeout(10) };

  my $line = <$c>;
  unless (defined $line) { close $c; exit; }
  while (my $h = <$c>) { last if $h =~ /^\r?\n$/; }   # descarta cabecalhos

  my ($method, $target) = $line =~ m{^(\w+)\s+(\S+)};
  unless (defined $method && defined $target) {
    send_response($c, '400 Bad Request', 'text/plain; charset=utf-8', 'Requisicao invalida');
    close $c; exit;
  }

  if ($method ne 'GET' && $method ne 'HEAD') {
    send_response($c, '405 Method Not Allowed', 'text/plain; charset=utf-8', 'Metodo nao suportado');
    close $c; exit;
  }

  my ($path) = split /\?/, $target, 2;
  $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;       # decodifica %XX
  $path = '/index.html' if $path eq '/';

  # Bloqueia travessia de diretorio antes de tocar no disco
  if ($path =~ /\0/ || $path =~ m{(^|/)\.\.(/|$)}) {
    send_response($c, '403 Forbidden', 'text/plain; charset=utf-8', 'Forbidden');
    close $c; exit;
  }

  my $file = $ROOT . $path;
  $file =~ s{/+}{/}g;

  unless (index($file, "$ROOT/") == 0 && -f $file) {
    send_response($c, '404 Not Found', 'text/plain; charset=utf-8', 'Nao encontrado / Not found');
    close $c; exit;
  }

  my ($ext) = $file =~ /\.([A-Za-z0-9]+)$/;
  my $type = $TYPES{ lc($ext // '') } || 'application/octet-stream';

  if (open my $fh, '<', $file) {
    binmode $fh;
    local $/;
    my $body = <$fh>;
    close $fh;
    $body = '' if $method eq 'HEAD';
    send_response($c, '200 OK', $type, $body);
  } else {
    send_response($c, '500 Internal Server Error', 'text/plain; charset=utf-8', 'Erro de leitura');
  }

  close $c;
  exit;                                # filho encerra; so o pai segue aceitando
}
