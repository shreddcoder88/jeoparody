import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import Question from './question.js';
import * as serviceWorker from './serviceWorker';
//import * as firebase from "firebase/app";
import {ReactComponent as Restart} from "./refresh-24px.svg";
import {ReactComponent as NoWifi} from "./wifi_off-black-24dp.svg"


function getCategories(nextPage) {  //TODO Add pagination for categories
                                    //TODO Add error catching
    //let time = new Date();
    let offset = "offset=" + nextPage;
    return fetch("https://jservice.io/api/categories?count=6;"+ offset)
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
            return "error";
        })
        
}
function getClues(id){ //TODO Add error catching
    var category = "id=";
    var data = Promise.all( id.map( async element=> {return await (fetch("https://jservice.io/api/category?"+ category+element.id+';')
                                .then(response => response.json())
                                .then(function (data) {
                                    console.log('getClues', data)
                                    data.clues.forEach(element => { 
                                        if(!element.value){throw new Error("Value is null")}
                                    });
                                    return data;}))}))
                                .catch(function(error){ 
                                    console.error(error);
                                    return null;
                                })
    return data;        
}
class DisplayError extends React.Component{  //Error Boundary
    constructor(props){
        super(props);
        this.state ={ noInternet: props.noInternet};
        }

    render(){
        if(this.state.noInternet){
        return (
        <div>
        {/* <svg id="NoWifi"/> */}
        <NoWifi className="nowifi"></NoWifi>
        <div id="error">
            <p>Jeoparody requires internet connection.<br/>Please check your connection</p>
            <button onClick={this.props.onClick}>Retry</button>
        </div></div>)}
    
         return this.props.children;
    }
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

function NoInternet(props){
    return(<div>
              <NoWifi/>
              <h2>No Internet Connection</h2>
              <button>X</button>  
           </div>
    )
}

function Podium(props){
    return(<div className="podium">
                <p id="score" title="Score">${props.score}</p>
                <p id="player">{props.name}</p>
            </div>)
}
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

function Player(props){
    return (<div className={props.className}>
                <form id="form" onSubmit={props.handleSubmit}>
                    <input id="name" type="text" form="form" autoComplete="off" autoFocus={true} placeholder="Name" />
                    <button id="submit" type="button" onClick={props.onClick} value="Start" >Start</button>
                </form>
            </div>)
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
            timerValue: 0,
            nameActive: false,
            name: "You",
            loading: false,
            finalScore: false
        };
        //this.showQuestion = this.showQuestion.bind(this);
        this.checkAnswer = this.checkAnswer.bind(this);
        this.nextRound = this.nextRound.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
    }
   

    handleSubmit(e){
        e.preventDefault();
        this.start();
    }

    endGame(){
        //document.querySelector("dialog").showModal();
        this.setState({playing: false, nameActive: false, finalScore: true, round: 1, questionsLeft: 30})        
    }
    toggleDialog(open){
        if(open){this.setState({finalScore: true})};
        this.setState({finalScore: false, score: 0});

    }
    
    async nextRound(){ //TODO restart the board after for next round
        if(this.state.round > 3) {
            this.endGame();
            return;}
        this.setState({offset: this.state.offset + 6});
        let nextPage = this.state.offset;
        let categories = await getCategories(nextPage);
        if (!categories) return;
        if(categories ==="error"){this.setState({noInternet: true}); return};
        let clues = await getClues(categories);
        if(!clues){return this.nextRound()}
        this.setState({clue: clues, category: categories, questionsLeft: 30});
        this.createColumn();
        this.renderValues();
        //enable all the value buttons
        
    }

    checkAnswer(){//TODO create a regexp that takes <i><i/> to literal from answers
                    //TODO add "$" to score 
                    //TODO color code score green/red for increase/decrease values
                    //TODO fix regexp conflict with multiple identical prefixes
                    //TODO make the right answer in parenthesis as optional
        const answer = document.getElementById("answer").value.toLowerCase();
        let correct;
        

        try {// eslint-disable-next-line
            correct = answer.toLowerCase().replaceAll(/a\s|the\s|an\s|<i>|<\/i>/g, "") == this.state.answer.toLowerCase().replaceAll(/a\s|the\s|an\s|<i>|<\/i>/g, ""); 
        } catch (error) {

            console.error(error, correct);
            // eslint-disable-next-line
            correct = answer.toLowerCase().replace(/a\s|the\s|an\s|<i>|<\/i>/g, "") == this.state.answer.toLowerCase().replace(/a\s|the\s|an\s|<i>|<\/i>/g, ""); 
            console.info("Correct answer:", answer.toLowerCase().replaceAll(/a\s|the\s|an\s|<i>|<\/i>/g, ""));
            //Use a different method other than replaceAll
        }
        console.info("Raw Answer: ",answer)
        console.log("User answer:", this.state.answer.toLowerCase());
        const value = this.state.value;
        console.info(typeof value);
        console.log(correct ? " Answer is correct!" : "Answer is wrong!");
        let score;
        if (correct) 
            {score = this.state.score + value;
            this.setState({score: score})}
        console.info("score",this.state.score);
        this.setState({correctAnswerIsActive: true});
        setTimeout(()=>{this.setState({correctAnswerIsActive: false})},5000);
        if(this.state.questionsLeft < 1){
            this.setState({round: this.state.round + 1})
            this.nextRound();
        } 
    }

    showQuestion(e, id, ind, value) {
         
         var question = this.state.clue.find(function (clues) {                
              return (clues.id === id)
               // clues[ind].category_id === id);
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
                if(!this.state.playing) {
                    this.setState({questionIsActive: false, timerValue: 0});
                    clearInterval(answerTimer);
                }
            }, 2000);
         //TODO sync setTimeout with timer progress bar
         e.currentTarget.disabled=true;
         e.currentTarget.innerText="";
        //  let element = document.getElementById(id).children[buttonId];
        //  element.disabled=true;
        //  element.innerText="";
         this.setState({questionsLeft: this.state.questionsLeft - 1});         
    }

    renderValues(){
        //let clue;
        return ReactDOM.render(
            /*TODO add key to children
             * Refactor as a function component
             * Use Ref to disable and clear button
             * check if value is null, fix if null*/
            
            this.state.clue.map(category =>
                            

                            <div id={category.id}>{
                                
                            <React.Fragment key={category.id}>
                           
                                {this.qualifyClues(category.clues)} 
                                
                            </React.Fragment>}
                            </div>), document.querySelector('#amount')
           );
        
    }
    
    // Return an actual value instead of null. Maybe convert as s bonus question with *3 value.
    qualifyClues(clues){
        let column = [] ;
        let prev, a = 0;

        clues.sort(function(a,b){return a.value-b.value})
        try {
            for (let i = 0; column.length < 5; i++) {       // prevents duplicate values
                if (clues[i].value === prev) { 
                    prev = clues[i].value;
                    continue;
                } 
                column[a] = <button id={a} key={clues[i].value} onClick={(e) => this.showQuestion(e, clues[i].category_id, i, clues[i].value)}>{'$' + clues[i].value}</button>
                    prev = clues[i].value;
                    a++;       
            }
                
            } catch (error) {
                console.error(error);
                return this.start();
            }
        return column;
    }

    createColumn() {
        return ReactDOM.render(<Column item={this.state.category}/>, document.getElementById('categories'));
        
    }

    play(){
        this.setState({playing: false, noInternet: false, loading: false, questionsLeft: 30});
        this.setState({nameActive: true})       
    }
    
    
    async start() { //TODO add a Name Form
        //if(!document.getElementById("loading").open) document.getElementById("loading").showModal();
        this.setState({loading: true})
        const name = document.getElementById("name").value;
        this.setState({name: name});
        let startOffset = Math.floor(Math.random() *(18409) + 1);
        this.setState({offset: startOffset, score: 0});
        console.info("Starting ID: ", startOffset)
        var categories = await getCategories(startOffset);
        if (!categories)return;
        if(categories ==="error"){this.setState({noInternet: true}); return};
        //else this.setState({noInternet: false});
        console.log('categories',categories.map(obj => obj.id));
        var clues = await getClues(categories)
        if(!clues){ return this.start()}
        console.log('clues',clues);
        this.setState({ category: categories, playing: true, clue: clues, nameActive: false});
        this.createColumn();
        this.renderValues();
        this.setState({loading: false})
        //document.getElementById("loading").close();
    }

    render() {
        const intro = "JEOPARODY" //TODO Redesign the logo
        const copyright = "Clues are pulled from jservice. © jeopardy productions, inc. This app is not affiliated with jeopardy productions, inc."
        if(!this.state.noInternet){
        return (
            <div>
                
        {this.state.playing ? null :  <div><h1 className="title">{intro}</h1><button className="play" value="PLAY" onClick={()=>this.play()}>Play</button> <h2>{copyright}</h2></div>}
                {this.state.nameActive ? <Player className="askName-active" onClick={() => this.start()} handleSubmit={this.handleSubmit}/> : null}
                {/* {this.state.loading ? document.querySelector("dialog").showModal() : null } */}
                {this.state.finalScore ? <dialog id="final-score" open>Your Score<br></br> <p>${this.state.score}</p><button onClick={()=>this.toggleDialog(false)}>close</button></dialog> : null}
                {this.state.loading ? <dialog id="loading" autoFocus="true" open>Loading</dialog> : null}
                {this.state.noInternet ? <NoInternet/> : null}
               
                {this.state.playing ? 
                    <div className="stage" >
                        <div id="top-header"></div>
                        <div id="left-post"></div>
                        <div id="right-post"></div>
                        <DisplayError>
                        <button id="restart" title="Restart" onClick={()=>this.play()}><Restart className="restart-svg"></Restart></button>
                        </DisplayError>
                        <div id="round" title="Round"><b>{this.state.round}</b></div>
                        <div className ="game">
                            <div id='categories'></div>
                            <div id="amount"></div>
                            <Podium score={this.state.score} name={this.state.name}></Podium>
                            {this.state.questionIsActive ? <Question className={"question-active"} /* onChange={()=>this.checkAnswer} */ timer={this.state.timerValue} question={this.state.question}/> : null}
                            {this.state.correctAnswerIsActive ? <Question className={"question-active"} correctAnswerIsActive={this.state.correctAnswerIsActive} question={this.state.answer.replaceAll(/<i>|<\/i>|\\/g,"")}/> : null}
                        </div>

                    </div> : null}
            </div>
        );}
        return <DisplayError noInternet={this.state.noInternet} onClick={()=>this.play()}></DisplayError>
    }
}

class Screen extends React.Component {
    render() {
        return (

            <div className="screen">
                <title>Jeoparody </title>
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


ReactDOM.render(<Screen/>, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
