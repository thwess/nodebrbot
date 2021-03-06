var fs = require('fs');

var bot = module.parent.exports.bot;
var data = module.parent.exports.data;

var NICK = require(__dirname + '/../config.json').nick;
var CHANNEL = require(__dirname + '/../config.json').channel;

/*
 * Alimenta um contador de mensagens para cada usuário
 */

bot.addListener('message' + CHANNEL, function(from, message) {
  var userMessagesPath = 'core.user_messages';
  var userMessages = data.getPath(userMessagesPath);

  if (typeof userMessages === 'undefined') {
    userMessages = {};
  }

  if (typeof userMessages[from] === 'undefined') {
    userMessages[from] = 1;
  } else {
    userMessages[from]++;
  }

  data.setPath(userMessagesPath, userMessages);
});

/*
 * Registra/atualiza o pico de usuários do canal
 */

bot.addListener('names' + CHANNEL, function(nicks) {
  var usersPath = 'core.users';
  var users = data.getPath(usersPath);

  if (typeof users === 'undefined' || users.length === 1) {
    users = Object.keys(nicks);
    data.setPath(usersPath, users);
  }

  var recordPath = 'core.record';
  var record = data.getPath(recordPath);

  if (typeof record === 'undefined' || Object.keys(nicks).length > record) {
    record = Object.keys(nicks).length;
    data.setPath(recordPath, record);
    bot.message('Batemos um novo recorde: ' + record + ' usuários simultâneos!');
  }
});

/*
 * Boas vindas a novos usuários
 */

bot.addListener('join' + CHANNEL, function(nick) {
  var usersPath = 'core.users';
  var users = data.getPath(usersPath);

  if (typeof users === 'undefined') {
    users = [nick];
    data.setPath(usersPath, users);
  }

  if (users.indexOf(nick) === -1) {
    users.push(nick);
    data.setPath(usersPath, users);
    bot.message(nick + ', notei que é novo no canal, seja bem vindo :)');
  }

  // dispara o evento acima ('names' + CHANNEL)
  // para atualizar o recorde se necessário

  bot.send('NAMES', CHANNEL);
});

/*
 * Handler de exceções não capturadas
 */

bot.addListener('error', function() {
  console.log('Internal Error');
});

/*
 * Visualizar conteúdo do arquivo data.json
 * ao enviar "data" para o robô por PVT
 */

bot.addListener('pm', function(from, message) {
  if (message !== 'data') return;

  var dataFile = fs.readFileSync(__dirname + '/../data.json').toString();
  bot.say(from, dataFile);
});

/*
 * Método para simplificar o envio de mensagens
 */

bot.message = function(message) {
  bot.say(CHANNEL, message);
}