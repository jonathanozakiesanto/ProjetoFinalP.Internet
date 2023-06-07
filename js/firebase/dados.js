/**
 * Copyright 2023 Prof. Ms. Ricardo Leme All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict' //modo estrito

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} collection - Nome da collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */
async function obtemDados(collection) {
  let spinner = document.getElementById('carregandoDados')
  let tabela = document.getElementById('tabelaDados')
  await firebase.database().ref(collection).orderByChild('nome').on('value', (snapshot) => {
    tabela.innerHTML = ''
    let cabecalho = tabela.insertRow()
    cabecalho.className = 'fundo-laranja-escuro';
    cabecalho.insertCell().textContent = 'Nome do Evento';
    cabecalho.insertCell().textContent = 'Data do Evento';
    cabecalho.insertCell().textContent = 'Email';
    cabecalho.insertCell().textContent = 'Categoria';
    cabecalho.insertCell().textContent = 'Quantidade de Times';
    cabecalho.insertCell().textContent = 'Modalidades';
    cabecalho.insertCell().textContent = 'Cidade';
    cabecalho.insertCell().textContent = 'Estado';
    cabecalho.insertCell().innerHTML = 'Opções';

    snapshot.forEach(item => {
      // Dados do Firebase
      let db = item.ref._delegate._path.pieces_[0] //collection
      let id = item.ref._delegate._path.pieces_[1] //id do registro   
      //Criando as novas linhas na tabela
      let novaLinha = tabela.insertRow()
      novaLinha.insertCell().innerHTML = '<small>' + item.val().nome + '</small>'
      novaLinha.insertCell().textContent = new Date(item.val().dataevento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      novaLinha.insertCell().innerHTML = '<small>' + item.val().email + '</small>'
      novaLinha.insertCell().textContent = item.val().estilo
      novaLinha.insertCell().textContent = item.val().times;
      novaLinha.insertCell().textContent = item.val().modalidades;
      novaLinha.insertCell().innerHTML = '<small>'+ item.val().cidade + '</small>'
      novaLinha.insertCell().textContent = item.val().estado
      novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' onclick=remover('${db}','${id}')><i class="bi bi-trash"></i></button>
      <button class='btn btn-sm btn-warning' onclick=carregaDadosAlteracao('${db}','${id}')><i class="bi bi-pencil-square"></i></button>`

    })
    let rodape = tabela.insertRow()
    rodape.className = ''
    rodape.insertCell().colSpan = "8"
    rodape.insertCell().innerHTML = totalRegistros(collection)

  })
  spinner.classList.add('d-none') //oculta o carregando...
}

/**
 * obtemDados.
 * Obtem dados da collection a partir do Firebase.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {object} - Os dados do registro serão vinculados aos inputs do formulário.
 */

async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('nome').value = snapshot.val().nome
    document.getElementById('telefone').value = snapshot.val().telefone
    document.getElementById('email').value = snapshot.val().email
    document.getElementById('dataevento').value = snapshot.val().dataevento
    document.getElementById('cidade').value = snapshot.val().cidade
    document.getElementById('estado').value = snapshot.val().estado
    if (snapshot.val().estilo === 'Amador') {
      document.getElementById('estiloAmador').checked = true
    } else {
      document.getElementById('estiloProfissional').checked = true
    }
  })

  document.getElementById('nome').focus() //Definimos o foco no campo nome
}



/**
 * incluir.
 * Inclui os dados do formulário na collection do Firebase.
 * @param {object} event - Evento do objeto clicado
 * @param {string} collection - Nome da collection no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function salvar(event, collection) {
  event.preventDefault();

  if (document.getElementById('nome').value === '') {
    alerta('⚠️ É obrigatório informar o nome!', 'warning');
    return;
  } else if (document.getElementById('email').value === '') {
    alerta('⚠️ É obrigatório informar o email!', 'warning');
    return;
  } else if (document.getElementById('dataevento').value === '') {
    alerta('⚠️ É obrigatório informar a data do Evento!', 'warning');
    return;
  } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(document.getElementById('telefone').value)) {
    alerta('⚠️ O telefone informado é inválido!', 'warning');
    return;
  } else if (document.getElementById('times').value < 2 || document.getElementById('times').value > 32) {
    alerta('⚠️ A quantidade de times deve estar entre 2 e 32.', 'warning');
    return;
    }else if (document.querySelectorAll('input[name="modalidades"]:checked').length === 0) {
      alerta('⚠️ Selecione pelo menos uma modalidade!', 'warning');
      return;
    }
    else if (document.getElementById('cidade').value === '') {
    alerta('⚠️ É obrigatório informar a cidade!', 'warning');
    return;
  } else if (document.getElementById('estado').value === 'Selecione um estado') {
    alerta('⚠️ É obrigatório informar o estado!', 'warning');
    return;
  } else if (document.getElementById('premiacao').value === 'Abra e escolha um valor') {
    alerta('⚠️ É obrigatório informar um valor de premiação!', 'warning');
    return;
  }
  if (document.getElementById('id').value !== '') {
    alterar(event, collection);
  } else {
    incluir(event, collection);
  }
}

async function incluir(event, collection) {
  let usuarioAtual = firebase.auth().currentUser
  let botaoSalvar = document.getElementById('btnSalvar')
  botaoSalvar.innerText = 'Aguarde...'
  event.preventDefault()
  //Obtendo os campos do formulário
  const form = document.forms[0];
  const data = new FormData(form);
  //Obtendo os valores dos campos
  const values = Object.fromEntries(data.entries());
  //Enviando os dados dos campos para o Firebase
  return await firebase.database().ref(collection).push({
    nome: values.nome.toUpperCase(),
    email: values.email.toLowerCase(),
    estilo: values.estilo,
    dataevento: values.dataevento,
    times: values.times,
    modalidades: Array.from(document.querySelectorAll('input[name="modalidades"]:checked')).map(checkbox => checkbox.value),
    telefone: values.telefone,
    cidade: values.cidade,
    estado: values.estado,
    dataInclusao: new Date()    
  })
    .then(() => {
      alerta(`✅ Registro incluído com sucesso!`, 'success')
      document.getElementById('formCadastro').reset() //limpa o form
      //Voltamos o botão Salvar para o estado original      
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar'
    })
    .catch(error => {
      alerta('❌ Falha ao incluir: ' + error.message, 'danger')
    })

}



async function alterar(event, collection) {
  let usuarioAtual = firebase.auth().currentUser
  let botaoSalvar = document.getElementById('btnSalvar')
  botaoSalvar.innerText = 'Aguarde...'
  event.preventDefault()
  //Obtendo os campos do formulário
  const form = document.forms[0];
  const data = new FormData(form);
  //Obtendo os valores dos campos
  const values = Object.fromEntries(data.entries());
  //Enviando os dados dos campos para o Firebase
  return await firebase.database().ref().child(collection + '/' + values.id).update({
    nome: values.nome.toUpperCase(),
    email: values.email.toLowerCase(),
    estilo: values.estilo,
    dataevento: values.dataevento,
    times: values.times,
    modalidades: Array.from(document.querySelectorAll('input[name="modalidades"]:checked')).map(checkbox => checkbox.value),
    telefone: values.telefone,
    cidade: values.cidade,
    estado: values.estado,
    usuarioAlteracao: {
      uid: usuarioAtual.uid,
      nome: usuarioAtual.displayName,
      urlImagem: usuarioAtual.photoURL,
      email: usuarioAtual.email,
      dataAlteracao: new Date()
    }
  })
    .then(() => {
      alerta('✅ Registro alterado com sucesso!', 'success')
      document.getElementById('formCadastro').reset()
      document.getElementById('id').value = ''
      botaoSalvar.innerHTML = '<i class="bi bi-save-fill"></i> Salvar'
    })
    .catch(error => {
      console.error(error.code)
      console.error(error.message)
      alerta('❌ Falha ao alterar: ' + error.message, 'danger')
    })
}

/**
 * remover.
 * Remove os dados da collection a partir do id passado.
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */
async function remover(db, id) {
  if (window.confirm("⚠️Confirma a exclusão do registro?")) {
    let dadoExclusao = await firebase.database().ref().child(db + '/' + id)
    dadoExclusao.remove()
      .then(() => {
        alerta('✅ Registro removido com sucesso!', 'success')
      })
      .catch(error => {
        console.error(error.code)
        console.error(error.message)
        alerta('❌ Falha ao excluir: ' + error.message, 'danger')
      })
  }
}


/**
 * totalRegistros
 * Retornar a contagem do total de registros da collection informada
 * @param {string} collection - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function totalRegistros(collection) {
  var retorno = '...'
  firebase.database().ref(collection).on('value', (snap) => {
    if (snap.numChildren() === 0) {
      retorno = '⚠️ Ainda não há nenhum registro cadastrado!'
    } else {
      retorno = `Total: <span class="badge fundo-laranja-escuro"> ${snap.numChildren()} </span>`
    }
  })
  return retorno
}

/**
 * Formata o valor do campo de telefone com parênteses, espaço e traço enquanto o usuário digita os dados.
 *
 * @param {object} campo - O campo de entrada do telefone.
 */
function formatarTelefone(campo) {
  // Remove caracteres não numéricos
  var telefone = campo.value.replace(/\D/g, '');

  // Adiciona parênteses, espaço e traço conforme o usuário digita
  telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
  telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');

  // Atualiza o valor do campo
  campo.value = telefone;
}

