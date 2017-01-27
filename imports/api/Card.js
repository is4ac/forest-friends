/**
 * Created by isung on 1/27/17.
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