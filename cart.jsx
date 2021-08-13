//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

// The below can be moved to another helper file


  const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
 
  const [url, setUrl] = useState(initialUrl);
 
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,

  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// The above can be moved to another file. 

const Products = () => {
  const [items, setItems] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;

  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");

  
// If i use this below I can load stock when the page loads. It also changes the restock and replaces
//


  useEffect(async () => {
    const rawData = await fetch(query);
    const data = await rawData.json();
    setItems(data);
  }, []);
  

  // If  I uncomment the section below.  Restocking will load below the current stock list. 
/*
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );

  */

  // console.log(`Rendering Products ${JSON.stringify(data)}`);
 const addToCart = (e) => {
  let name = e.target.name;
  let item = items.filter((item) => item.name == name);
  if (item[0].instock == 0) return;
  item[0].instock = item[0].instock - 1;
  console.log(`add to Cart ${JSON.stringify(item)}`);
  setCart([...cart, ...item]);
};


const deleteCartItem = (delIndex) => {
  // this is the index in the cart not in the Product List

  let newCart = cart.filter((item, i) => delIndex != i);
  let target = cart.filter((item, index) => delIndex == index);
  let newItems = items.map((item, index) => {
    if (item.name == target[0].name) item.instock = item.instock + 1;
    return item;
  });
  setCart(newCart);
  setItems(newItems);
};

// janky pay function
const payCart = (payIndex) => {
setCart([]);
};


  //const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    let n = index + 1049 + Math.floor(Math.random() *5); 
    let url = "https://picsum.photos/id/" + n + "/50/50";

    // below lines were used to replace with a rando image from picsum
    // code from modifed version to the line 161  -- left comment for future refrence
    // <Image src={photos[index % 4]} width={70} roundedCircle></Image>
    // <Image src={url} width={70} roundedCircle></Image>

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name + " "}:::::{" $" + item.cost + " "}:
          {" In Stock " + item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
          <button>Remove Item</button>
             {" $" + item.cost} from {item.country}
         
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
  // cart.map((item, index) => deleteCartItem(index));
    return newTotal;
  };

  // janky pay button -- for now.. 
  const pay = () => {
    cart.map((index) => payCart(index));
  };


// Restocking functions are here
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>Total Due ${finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
          
          <h2>PAY!</h2>
          <Button onClick={pay}>Pay </Button>
         
        
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
