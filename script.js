// APIs: 
// https://jservice.io/popular/21
// https://jservice.io/popular/49
// https://jservice.io/popular/51
// https://jservice.io/popular/17

class TriviaGameShow {
  constructor(element, options={}) {
    this.useCategoryIds = options.useCategoryIds || [21, 49, 51, 17];

    //Database
    this.categories = [];
    this.clues = {};

    //State
    this.currentClue = null;
    this.score = 0;

    //Elements
    this.boardElement = element.querySelector(".board");
    this.scoreCountElement = element.querySelector(".score-count");
    this.formElement = element.querySelector("form");
    this.inputElement = element.querySelector("input[name=user-answer]");
    this.modalElement = element.querySelector(".card-modal");
    this.clueTextElement = element.querySelector(".clue-text");
    this.resultElement = element.querySelector(".result");
    this.resultTextElement = element.querySelector(".result_correct-answer-text");
    this.successTextElement = element.querySelector(".result_success");
    this.failTextElement = element.querySelector(".result_fail");
    this.cluecategory = element.querySelector(".clue-category");
  }
  initGame() {

    this.boardElement.addEventListener("click", event => {
      if (event.target.dataset.clueId) {
        this.handleClueClick(event);
      }
    });
    this.formElement.addEventListener("submit", event => {
      this.handleFormSubmit(event);
    });

    this.updateScore(0);

    this.fetchCategories();
  }


 fetchCategories() {      
      //Fetch all of the data from the API
      const categories = this.useCategoryIds.map(category_id => {
         return new Promise((resolve, reject) => {
            fetch(`https://jservice.io/api/category?id=${category_id}`)
               .then(response => response.json()).then(data => {
                  resolve(data);
               });
         });
      });


    
    Promise.all(categories).then(results => {
      results.forEach((result, categoryIndex) => {
        var category = {
          title: result.title,
          clues: []
        }

        var clues = shuffle(result.clues).splice(0,5).forEach((clue, index)=> {
          console.log(clue)

          var clueId = categoryIndex + "-" + index;
          category.clues.push(clueId);

          this.clues[clueId] = {
            question: clue.question, 
            answer: clue.answer,
            value: (index + 1) * 100
          };
        })

        this.categories.push(category);
      });
      this.categories.forEach((c) => {
            this.renderCategory(c);
         });
      });
   }

  renderCategory(category) {
    let column = document.createElement("div");
    column.classList.add("column");

    column.innerHTML = (
      `<header>${category.title}</header><ul></ul>`
    ).trim();

    var ul = column.querySelector("ul");
    category.clues.forEach(clueId => {
      var clue = this.clues[clueId];
      ul.innerHTML += `<li><button data-clue-id=${clueId} data-category=${category.title}>${clue.value}</button></li>`


    })

    this.boardElement.appendChild(column);
  }

    updateScore(change) {
    this.score += change;
    this.scoreCountElement.textContent = this.score;
  }


  handleClueClick(event) {
    var clue = this.clues[event.target.dataset.clueId];

    //Mark this button as used
    event.target.classList.add("used");
      
    //Clear out the input field
    this.inputElement.value = "";
      
    //Update current clue
    this.currentClue = clue;

    //Get Category
    var category = event.target.dataset.category;
    //Update the text
    this.cluecategory.textContent = category;
    this.clueTextElement.textContent = this.currentClue.question;
    this.resultTextElement.textContent = this.currentClue.answer;

    //Hide the result
    this.modalElement.classList.remove("showing-result");
      
    //Show the modal
    this.modalElement.classList.add("visible");
    this.inputElement.focus();
  }

  handleFormSubmit(event) {
    event.preventDefault();

    var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
    if (isCorrect) {
      this.updateScore(this.currentClue.value)
    }
    //Show the answer
    this.revealAnswer(isCorrect);

  }

  cleanseAnswer(input="") {
    var friendlyAnswer = input.toLowerCase();
    friendlyAnswer = friendlyAnswer.replace("<i>", "");
    friendlyAnswer = friendlyAnswer.replace("</i>", "");
    friendlyAnswer = friendlyAnswer.replace(/ /g, "");
    friendlyAnswer = friendlyAnswer.replace(/"/g, "");
    friendlyAnswer = friendlyAnswer.replace(/^a /, "");
    friendlyAnswer = friendlyAnswer.replace(/^an /, "");      
    return friendlyAnswer.trim();
  }

  revealAnswer(isCorrect) {
      
    //Show the individual success/fail case
    this.successTextElement.style.display = isCorrect ? "block" : "none";
    this.failTextElement.style.display = !isCorrect ? "block" : "none";
      
    //Show the whole result container
    this.modalElement.classList.add("showing-result");
      
    //Disappear after a short bit
    setTimeout(() => {
        this.modalElement.classList.remove("visible");
      }, 3000);
   }

}


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
} 

const game = new TriviaGameShow( document.querySelector(".app"), {});

game.initGame();