/**
 * Created by isung on 1/27/17.
 * Card object that stores the game logic portion and stores info about the card
 */
class Card {
    constructor(name, description) {
        let date = new Date();
        this.name = name;
        this.description = description;
        this.id = date.valueOf();
    }

    
}

export { Card };