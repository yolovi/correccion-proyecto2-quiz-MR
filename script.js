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
