import React, { Component } from 'react';
import {connect} from 'react-redux';
import {addRecipe, removeFromCalendar} from '../actions';
import {capitalize} from "../utils/helpers";
import CalendarIcon from 'react-icons/lib/fa/calendar-plus-o';
import ArroRightIcon from 'react-icons/lib/fa/arrow-circle-right';
import Modal from 'react-modal';
import Loading from 'react-loading';
import { fetchRecipes} from "../utils/api";
import FoodList from './FoodList';
import ShoppingList from './ShoppingList';

class App extends Component {

    //Jeito sem mapDispatchToProps
    // doThing = () => {
    //     this.props.dispatch(addRecipe({'day':'monday'}));
    // };

    constructor(props){
        super(props);
        this.state = {
            foodModalOpen:false,
            ingredientsModalOpen:false,
            loadingFood:false,
            meal:null,
            day: null,
            food: null,
        }
    }

    openFoodModal = ({meal, day}) => {
        this.setState(() => ({
            foodModalOpen: true,
            meal,
            day,
        }));
    };

    closeFoodModal = () => {
        this.setState(() => ({
            foodModalOpen:false,
            meal:null,
            day:null,
            food:null
        }))
    };

    openIngredientsModal = () => this.setState({ingredientsModalOpen:true});
    closeIngredientsModal = () => this.setState({ingredientsModalOpen:false});
    generateShoppingList = () => {
        return this.props.calendar.reduce((result,{meals}) => {
            const {breakfast, lunch, dinner } = meals;
            breakfast && result.push(breakfast);
            lunch && result.push(lunch);
            dinner && result.push(dinner);
            return result;
        },[]).reduce((ings, {ingredientLines}) => ings.concat(ingredientLines),[])

    };

    searchFood = (e) => {
        if(!this.input.value){
            return;
        }
        e.preventDefault();
        this.setState(()=>({loadingFood:true}));
        fetchRecipes(this.input.value)
            .then(food => this.setState({
                food,
                loadingFood:false
            }))
    };

    render() {
        const {foodModalOpen, loadingFood, food, ingredientsModalOpen} = this.state;
        const {calendar, remove, selectRecipe } = this.props;
        const mealOrder = ['breakfast', 'lunch','dinner'];
        return (
            <div className="container">

                <div className="nav">
                    <h1 className="header">UdaciMeals</h1>
                    <button
                        className="shopping-list"
                        onClick={this.openIngredientsModal}>
                        Shooping List
                    </button>
                </div>

                <ul className="meal-types">
                    {mealOrder.map(mealType => (
                        <li key={mealType} className="subheader">
                            {capitalize(mealType)}
                        </li>
                    ))}
                </ul>

                <div className="calendar">
                    <div className="days">
                        {calendar.map(({day}) => (<h3 key={day} className='subheader'>{capitalize(day)}</h3>))}
                    </div>
                    <div className="icon-grid">
                        {calendar.map(({day,meals}) => (
                            <ul key={day}>
                                {mealOrder.map(meal=>(
                                    <li key={meal} className="meal">
                                        { meals[meal]
                                            ? <div className="food-item">
                                                <img src={meals[meal].image} alt={meals[meal].label} />
                                                <button onClick={()=> remove({meal,day})}>Clear</button>
                                              </div>
                                            : <button onClick={() => this.openFoodModal({meal,day})} className="icon-btn">
                                                <CalendarIcon size={30}/>
                                              </button>
                                        }
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>

                <Modal
                    className="modal"
                    overlayClassName="overlay"
                    isOpen={foodModalOpen}
                    onRequestClose={this.closeFoodModal}
                    contentLabel="Modal"
                >
                    <div>
                        {loadingFood === true
                            ? <Loading delay={200} type="spin" color="#222" className="loading" />
                            : <div className="search-container">
                                  <h3 className="subheader">
                                      Buscando uma refeição em {capitalize(this.state.day)} {this.state.meal}.
                                  </h3>
                                  <div className="search">
                                      <input
                                          ref={input => this.input = input}
                                          type="text"
                                          placeholder="Search foods"
                                          className="food-input"
                                      />
                                      <button
                                          className="icon-btn"
                                          onClick={this.searchFood}>
                                          <ArroRightIcon size={30} />
                                      </button>
                                  </div>
                                  {food !== null && (
                                      <FoodList
                                        food={food}
                                        onSelect={ recipe => {
                                            selectRecipe({recipe, day:this.state.day, meal:this.state.meal});
                                            this.closeFoodModal();
                                        }}
                                      />
                                  )}
                              </div>
                        }
                    </div>
                </Modal>
                <Modal
                    className="modal"
                    overlayClassName="overlay"
                    isOpen={ingredientsModalOpen}
                    onRequestClose={this.closeIngredientsModal}
                    contentLabel='Modal'
                >
                    {ingredientsModalOpen && <ShoppingList list={this.generateShoppingList()} />}
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = ({calendar, food}, ownProps)=> {
    const dayOrder = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return {
        calendar: dayOrder.map(day => ({
                day,
                meals: Object.keys(calendar[day]).reduce((meals,meal)=>{
                    meals[meal] = calendar[day][meal] ? food[calendar[day][meal]] : null;
                    return meals;
                },{})
            }
        ))
    }
};

//com MapDispatchToProps
const mapDispatchToProps = (dispatch) => ({
    selectRecipe: (data) => dispatch(addRecipe(data)),
    remove: (data) => dispatch(removeFromCalendar(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(App);
