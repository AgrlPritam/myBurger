import React, {Component}  from 'react'
import Aux from '../../hoc/Auxiliary/Auxiliary'
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import Spinner from '../../components/UI/Spinner/Spinner'
import WithErrorHandler from '../../hoc/withErrorHandlers/withErrorHandler'
import axios from '../../axios-orders'

const INGREDIENT_PRICES = {
    salad: 30,
    cheese: 45,
    meat: 75,
    bacon: 60
}
class BurgerBuilder extends Component {
    state = {
        ingredients: null,
        totalPrice: 40,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        axios.get('https://react-my-burger-ac4e5-default-rtdb.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({ingredients: response.data})
            })
            .catch(error => this.setState({error:true}))
    }

    updatePurchaseState(ingredients)  {
        const sum = Object.keys(ingredients).map(igKey => {
            return ingredients[igKey]
        }).reduce((sum, el) => {
            return sum + el
        }, 0)
        this.setState({purchasable: sum >0})
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type]
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount
        const priceAddition = INGREDIENT_PRICES[type]
        const oldPrice = this.state.totalPrice
        const newPrice = oldPrice + priceAddition
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients})
        this.updatePurchaseState(updatedIngredients)
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type]
        if (oldCount <= 0){
            return
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        }
        updatedIngredients[type] = updatedCount
        const priceDeduction = INGREDIENT_PRICES[type]
        const oldPrice = this.state.totalPrice
        const newPrice = oldPrice - priceDeduction
        this.setState({totalPrice: newPrice, ingredients: updatedIngredients})
        this.updatePurchaseState(updatedIngredients)
    }

    purchaseHandler = () => {
        this.setState({purchasing: true})
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false})
    }

    purchaseContinueHandler = () => {
        //alert('You can Continue!!')
        this.setState({loading:true})
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'DevilHorns',
                address: {
                    lane: 'Test Lane 1',
                    pincode: '785524',
                    country: 'India'
                },
                email: 'test@test.com'
            },
            deliveryMethod: 'Fastest'
        }
        axios.post('/orders.json', order)      //For firebase database using axios each endpoints need a .json at end. MongoDB doesn't need this
            .then(response => 
                this.setState({loading:false, purchasing:false}))
            .catch(error => 
                this.setState({loading: false, purchasing:false}))
    }
    
    render() {
        const disabledInfo = {
            ...this.state.ingredients
        }
        // {salad:true, meat: false, .......}
        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        let orderSummary = null;

        let burger = this.state.error? <p>Ingredients can't be loaded</p> : <Spinner />

        if(this.state.ingredients) {
            burger =(
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls 
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                        price={this.state.totalPrice}
                    />
                </Aux>
            )
            orderSummary = <OrderSummary 
            ingredients={this.state.ingredients} 
            purchaseCancelled={this.purchaseCancelHandler}
            purchaseContinued={this.purchaseContinueHandler}
            price={this.state.totalPrice.toFixed(2)}
        />
        }

        if(this.state.loading) {
            orderSummary = <Spinner />
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        )
    }
}

export default WithErrorHandler(BurgerBuilder, axios);