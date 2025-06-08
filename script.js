/** 
 * CORRECCION:
 *  esto no se hace. El objetivo de esto es que no se ejecute el js hasta que el DOM haya cargado, como en nuestro
 *  html estamos cargando el js justo antes del cierre del body el DOM ya esta cargado, asi que esto no es necesario.
 *  Recuerda seguir el orden correcto: elementos del DOM > variables > eventos > funciones
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("El script está conectado");

  // Elementos del DOM
  const welcomeBox = document.getElementById("home");
  const quizBox = document.getElementById("quiz");
  const startBtn = document.getElementById("start-btn");

  // Variables globales
  let respuestaCorrecta = "";
  let preguntaActual = 1;
  const totalPreguntas = 10;
  let aciertos = 0;

  // Al hacer clic en "Comenzar ahora"
  startBtn.addEventListener("click", () => {
    console.log("¡Has hecho clic en el botón de comenzar!");

    welcomeBox.classList.add("hidden");
    quizBox.classList.remove("hidden");

    cargarPregunta();
  });

  /**
   * CORRECCION:
   *  No se puede llamar a la api para cada pregunta. Las consultas a la API conllevan un tiempo de espera, y además 
   *  muchas APIS son de pago, por lo que nos interesará hacer el menos número de llamadas posibles. En este caso haremos
   *  una llamada, guardaremos su respuesta en un array de objetos del tipo que tengan las preguntas y gestionaremos desde
   *  ahí como se van mostrando las preguntas.
   * Las api_url no se almacenan enteras, se almacena la base y el resto se construye segun el endpoint que necesites:
   *  API_URL_BASE = "https://opentdb.com/api.php?"
   *  const cantidad = 10; const tipo = "multiple";
   *  const apiUrl = `${API_URL_BASE}amount=${cantidad}&type=${tipo}`;
   */
  // Función para cargar una pregunta desde la API
  function cargarPregunta() {
    fetch("https://opentdb.com/api.php?amount=1&type=multiple")
      .then(res => res.json())
      .then(data => {
        if (!data.results || data.results.length === 0) {
          console.warn("❗ No se recibió una pregunta. Reintentando...");
          setTimeout(cargarPregunta, 1000);
          return;
        }

        const pregunta = data.results[0];
        const questionText = pregunta.question;
        const correctAnswer = pregunta.correct_answer;
        const incorrectAnswers = pregunta.incorrect_answers;
        /**
         * CORRECCION: correctAnswer te sobra, asigna a respuestaCorrecta directamente: respuestaCorrecta = pregunta.correct_answer;
         */
        respuestaCorrecta = correctAnswer;

        const allAnswers = [...incorrectAnswers, correctAnswer];
        allAnswers.sort(() => Math.random() - 0.5);

        quizBox.innerHTML = `
          <h2>${questionText}</h2>
          <p>Pregunta ${preguntaActual} de ${totalPreguntas}</p>
          <div class="options">
            ${allAnswers.map(answer => `
              <button class="answer-btn">${answer}</button>
            `).join("")}
          </div>
        `;

        const botones = document.querySelectorAll(".answer-btn");

        botones.forEach(boton => {
          boton.addEventListener("click", () => {
            const respuestaElegida = boton.textContent;

            // Desactivar todos los botones
            botones.forEach(b => b.disabled = true);

            /**
             * CORRECCION: los console.log están muy bien mientras desarrollamos, pero para entregar los eliminamos
             * a no ser que sean necesarios.
             */
            if (respuestaElegida === respuestaCorrecta) {
              console.log("✅ Respuesta correcta");
              aciertos++;
              boton.classList.add("correcta");
            } else {
              console.log("❌ Respuesta incorrecta");
              boton.classList.add("incorrecta");

              // Mostrar cuál era la correcta
              botones.forEach(b => {
                if (b.textContent === respuestaCorrecta) {
                  b.classList.add("correcta");
                }
              });
            }

            preguntaActual++;

            setTimeout(() => {
              if (preguntaActual <= totalPreguntas) {
                cargarPregunta();
              } else {
                mostrarResultados();
              }
            }, 1000);
          });
        });
      })
      .catch(error => {
        console.warn(" Error al contactar con la API. Reintentando...", error);
        setTimeout(cargarPregunta, 1000);
      });
  }

  // Función para mostrar los resultados finales
  function mostrarResultados() {
    console.log(" Fin del quiz");

    quizBox.innerHTML = `
      <h2>¡Has terminado el quiz!</h2>
      <p>Tu puntuación final es:</p>
      <div class="resultado">
        <strong>${aciertos} / ${totalPreguntas} aciertos</strong>
      </div>
      <button id="restart-btn">Jugar otra vez</button>
    `;

    const restartBtn = document.getElementById("restart-btn");
    restartBtn.addEventListener("click", () => {
      aciertos = 0;
      preguntaActual = 1;
      cargarPregunta();
    });
  }
});
