import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import Question from './question.js';
import * as serviceWorker from './serviceWorker';
//import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/messaging";


function getCategories(nextPage) {  //TODO Add pagination for categories
                                    //TODO Add error catching
    //let time = new Date();
    let offset = "offset=" + nextPage;
    return fetch("http://jservice.io/api/categories?count=6;"+ offset)
        .then(function(response){ 
            if (response.ok)
            return response.json();
            throw new Error("No internet Connection!");
        }) //add response check for network errors
        // .then(response => response.json())
        .then(function (data) {
            console.log(data);
            return data;
        })
        .catch(function(error){
            console.error(error, "No connection");
            displayError();
        })
        
}
function getClues(id){ //TODO Add error catching
    var category = "id=";
    var data = Promise.all( id.map( async element=> {return await (fetch("http://jservice.io/api/category?"+ category+element.id+';')
                                .then(response => response.json())
                                .then(function (data) {
                                    console.log('getClues', data)
                                    return data;}))}))
                                .catch(function(error, element){ 
                                    console.error(error);
                                })
    return data;        
}
function displayError() {
    return ReactDOM.render(
        <div id="error">
            <p>Apologies, Jeoparody requires internet connection.</p>
        </div>, document.getElementById("root"));
    
}


class Column extends React.Component {
    render() {
         console.log('categories',this.props.item)
         return (
            <div>{
                this.props.item.map(item =>
                    <React.Fragment key={item.id}>
                        {console.log(item.id)}
                        <button >{item.title}</button>
                    </React.Fragment>
                )}
            </div>);
                }   
}
function Podium(props){
    return(<div className="podium">
                <p id="score">{props.score}</p>
                <p id="player">John</p>
            </div>)
}
//TODO make an Answer input component 
function Answer(props){
    return ( <div className="answer-background">
                <progress id="timer" value={props.timer} max="60"></progress>
                <input id ="answer" autoComplete="off" type="text" onChange={props.onChange}  className="answer" autoFocus={true} placeholder="Answer"/>
            </div>)
}
//TODO hide answer input when correct answer is shown
function Question(props){
    return <><article className={props.className}>
                <h1>
                    {props.question}
                </h1>
            </article>
            {props.correctAnswerIsActive ? null : <Answer onChange={props.onChange} timer={props.timer} answer={props.question}/>}
            </>
        }
 
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            playing: false,
            value: null,
            questionsLeft: 30,
            round: 1,
            restart: ".restart",
            timerValue: 0,
        };
        this.showQuestion = this.showQuestion.bind(this);
        this.checkAnswer = this.checkAnswer.bind(this);
        this.nextRound = this.nextRound.bind(this);
        
    }
    
    async nextRound(){ //TODO restart the board after for next round
        this.setState({offset: this.state.offset + 6});
        let nextPage = this.state.offset;
        let categories = await getCategories(nextPage);
        let clues = await getClues(categories);
        this.setState({clue: clues, category: categories, questionsLeft: 29});
        this.createColumn();
        this.renderValues();
        //enable all the value buttons
        
    }

    checkAnswer(){//TODO create a regexp that takes <i><i/> to literal from answers
                    //TODO add "$" to score 
                    //TODO color code score green/red for positive/negative values
                    //TODO fix regexp conflict with multiple identical prefixes
                    //TODO make the right answer in parenthesis as optional
        const answer = document.getElementById("answer").value.toLowerCase();
        // eslint-disable-next-line
        const correct = answer.replace(/a\s|the\s|an\s|<i>|<\/i>/, "") == this.state.answer.toLowerCase().replace(/a\s|the\s|an\s|<i>|<\/i>/, ""); 
        console.log("answer",answer.replace(/a\s|the\s|an\s|<i>|<\/i>/, ""))
        console.log("state.answer", this.state.answer.toLowerCase().replace(/a\s|the\s|an\s|<i>|<\/i>/, ""));
        console.log(this.state.answer.replace(/a\s|the\s|an\s|<i>|<\/i>/, ""))
        console.info("Answer is:", this.state.answer);
        console.info(answer);
        const value = this.state.value;
        console.info(typeof value);
        console.log(correct ? " Answer is correct!" : "Answer is wrong!");
        var score = correct ? this.state.score + value : this.state.score - value; 
        this.setState({score: score})
        console.info("score",this.state.score);
        this.setState({correctAnswerIsActive: true});
        setTimeout(()=>{this.setState({correctAnswerIsActive: false})},5000);

        if(this.state.questionsLeft === 0) this.nextRound();
    }

    showQuestion(id, ind, value) {
         
         var question = this.state.clue.find(function (clues) {                
              return (clues.clues[ind].category_id === id);
         });
         console.log("Value:", value + " Is"+ typeof value)
         this.setState({questionIsActive: true, question: question.clues[ind].question, answer: question.clues[ind].answer, value: value});
        var answerTimer = setInterval(()=>{this.setState({timerValue: this.state.timerValue + 10}); 
            if(this.state.timerValue > 60)
            {
                this.checkAnswer();
                this.setState({questionIsActive: false, timerValue: 0});
                clearInterval(answerTimer);
                }
            }, 2000);
         //TODO sync setTimeout with timer progress bar
         let element = document.getElementById(id).children[ind];
         element.disabled =true;
         element.innerText="";
         this.setState({questionsLeft: this.state.questionsLeft - 1});
         if(this.state.questionsLeft === 0){this.nextRound()}
         
    }

    renderValues(){
        //let clue;
        return ReactDOM.render(
            /*TODO add key to children
             * empty value buttons after question is answered
             * Refactor as a function component
             * Use Ref to disable and clear button
             * check if value is null, fix if null*/
            
            this.state.clue.map(category =>
                            

                            <div id={category.id}>{
                                
                            <React.Fragment key={category.id}>
                                
                                {/* {clue = category.clues.filter(element => element.value != null)}
                                {console.info('column', clue)}
                                {this.fixNUll()} */}
                                
                                <button  id={0} key={category.clues[0].value} onClick={()=>this.showQuestion(category.id,0,category.clues[0].value)}>{'$'+category.clues[0].value}</button>
                                <button id={1} key={category.clues[1].value} onClick={()=>this.showQuestion(category.id,1,category.clues[1].value)}>{'$'+category.clues[1].value}</button>
                                <button id={2} key={category.clues[2].value} onClick={()=>this.showQuestion(category.id,2,category.clues[2].value)}>{'$'+category.clues[2].value}</button>
                                <button id={3} key={category.clues[3].value} onClick={()=>this.showQuestion(category.id,3,category.clues[3].value)}>{'$'+category.clues[3].value}</button>
                                <button id={4} key={category.clues[4].value} onClick={()=>this.showQuestion(category.id,4,category.clues[4].value)}>{'$'+category.clues[4].value}</button>
                            </React.Fragment>}
                            </div>), document.querySelector('#amount')
           );
        
    }
    
    // Return an actual value instead of null. Maybe convert as s bonus question with X3 value.
    fixNUll(clues, index){
        if(index === 0){return (clues[index+2].value - clues[index+1].value)}
        else if(index === 4){return (clues[index-1].value - clues[index-2].value)}
        else {return (clues[index+1].value - clues[index-1].value)*(index-1)}
    }

    createColumn() {
        return ReactDOM.render(<Column item={this.state.category}/>, document.getElementById('categories'));
        
    }
    
    
    async start() { //TODO add a Name Form
        let startOffset = Math.floor(Math.random() *(18409) + 1);
        this.setState({offset: startOffset});
        console.info("Starting ID: ", startOffset)
        var categories = await getCategories(startOffset);
        if (!categories) return;
        console.log('categories',categories.map(obj => obj.id)); 
        var clues = await getClues(categories)
        console.log('clues',clues);
        this.setState({ category: categories, playing: true, clue: clues});
        this.createColumn();
        this.renderValues();

    }

    render() {
        const intro = "JEOPARODY" //TODO Redesign the logo
        return (
            <div>
                {this.state.playing ? null :  <div><h1 className="title">{intro}</h1><button className="play" value="PLAY" onClick={() => this.start()}>Play</button></div>}

                {/* {this.state.playing ? <output id="score">{this.state.score}</output> : null} */}
                {this.state.playing ? 
                    <div className="stage" >
                        <div id="left-post"></div>
                        <div id="right-post"></div>
                        <button id="restart" onClick={()=>this.start()}>Restart</button>
                        <div className ="game">
                            <div id='categories'></div>
                            <div id="amount"></div>
                            <Podium score={this.state.score}></Podium>
                            {this.state.questionIsActive ? <Question className={"question-active"} /* onChange={()=>this.checkAnswer} */ timer={this.state.timerValue} question={this.state.question}/> : null}
                            {this.state.correctAnswerIsActive ? <Question className={"question-active"} correctAnswerIsActive={this.state.correctAnswerIsActive} question={this.state.answer}/> : null}
                        </div>

                    </div> : null}
            </div>
        );
    }
}
// eslint-disable-next-line
{/* <div className="game" >
                    <div id='categories'></div>
                    <div id="amount"></div>
                    {this.state.questionIsActive ? <Question className={"question-active"} /* onChange={()=>this.checkAnswer}  question={this.state.question}/> : null}
                    //{this.state.correctAnswerIsActive ? <Question className={"question-active"} /* onChange={()=>this.checkAnswer}  question={this.state.answer}/> : null}

               // </div> */}

class Screen extends React.Component {
    render() {
        return (
            <div className="screen">
                <div className="screen-box">
                    <Board />
                </div>
                <div className="screen-info">
                    <div>{/* intro */}</div>
                </div>
            </div>
        );
    }
}


ReactDOM.render(<Screen />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
