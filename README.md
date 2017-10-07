# CS546-Outfit Product Forum
## Team
+ Daniel Heyman
+ Justin Tsang
+ Weronika Zamlynny

## Project Name

Style With Me

## Setup

### Mongo Setup

1. In separate terminal, run `mongod` or `sudo mongod` to start MongoDB service
2. Keep this process running as long as development is happening

### Node Setup

1. Run `npm install` to install all Node dependencies
2. Run `npm run seed` to populate MongoDB with user and forum documents
3. Run `npm start` to start the Express server
4. On open browser, enter `localhost:3000` to access the webpage

**Requirements**

- Need Node version 7+ (We use Object.values)

## How to Use Our Product

- Demo of how to use our product is included in the video presentation
- It showcases all the features of our product as well as how to navigate the webpage
- Logic:
  1. Landing Page
    - Create forums
    - View own forums
    - View community forums
  2. Community forums
    - Search for forums based on criteria: text in title, content, or clothing name, price range, and label(s)
  3. Forum
    - View title, content, and like and dislike of forum
    - View all comments for that comment and like and dislike for each comments
    - If owner of forum, able update and delete forum
    - If owner of comment, able to update and delete comment
  3. Profile
    - View general info and avatar of user
    - Edit profile fields such as avatar, email, and gender
  4. Login
    - Login to webpage with credentials
  5. Sign Up
    - Able to sign up for account on webpage
  6. Create Forum
    - Able to give pending creation forum title, content, and labels
    - Supports URL markdown, so if provide a URL of specific company product, our scraper will extract images and pricing for product and display on forum page

## Project Proposal
A clothing forum website that allows users to create new and search for existing forum threads that focus on certain clothing brand, type, or outfit. The forum thread provides a platform for users to converse about that brand, type, or outfit and each forum can link sources to purchase those item(s) as well as provide general statistic information regarding those item(s).  

## Backlog

### Core Features
1. User creation and preference modification
2. Create and maintain own forums regarding certain clothing type, brand, or outfit
3. View and comment in other users' forums
4. Allow user to post images of that outfit or clothes
5. Search new forum based on clothing type, brand, or tag(s)
6. Landing page that displays forums sorted by most recent or most popular and can filter by clothing type/tag(s)

### Nice-to-Have Features
1. Link forum to external webpage to purchase and/or scrape info about brand or clothes
2. Display graphs in webpage showing visual of price changes and sales of outfit
3. Get notification when user comments on forum, price update or stock update on outfit

## Database Proposal
### 1. Users
- The user collection will store all users and their profiles. Users will be able to login, update their profile, delete their account, and view forums they created.  
```javascript
{
    _id: 'string',
    password: 'string', // hashed
    sessionId: 'string', // Session ID
    followedForums: ['string'], // ids of forums
    profile: {
        avatar: 'string' // base64 encoding
        displayName: 'string',
        email: 'string',
        isMale: 'boolean',
    }
}
```
- Ex:

```javascript
{
    _id: '7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310',
    password: '$2a$08$XdvNkfdNIL8Fq7l8xsuIUeSbNOFgK0M0iV5HOskfVn7.PWncShU.O',
    sessionId: 'b3988882-627f-4c59-8d5d-54b7a43b030e',
    followedForums: ["3eb58e7d-4826-4ab5-bb9b-7eca07fc0d11", "a3652ef7-8b63-478e-b431-516825227827"],
    profile: {
        avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCAGQAlgDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAQIAAwQFBgcI/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/9oADAMBAAIQAxAAAAHlekxcfN7Wvm8xNvA9Np3ny+u7TqZdmjtY15fZr2nP39ivF5mfrDWeF2+Vtw9ZX5x+e+7fiWXtTg6tZ6kxXVfEepJCSQkkJJCSQkkJJCSQkkJJCSQkkJJCSQkkJJCSQkkIDASRZJIEIIDIEkX86bvTei9nD5tb9k1ct/Bun9j5tvivaN1eeuPX6XnxN/P5idtvB9LU7/A7OSzkZOvNc+dfmeX1V/mzy6+ixZKle9",
        displayName: 'Justin Tsang',
        email: 'justin@test.com',
        isMale: true,
    }
}
```

| Name | Type | Description |
|------|------|-------------|
| _id  | string | A globally unique identifier to represent the user |
| password | string | A bcrypted string that is the salted, hashed version of the user's password |
| sessionId | string | A globally unique identifier to represent the user's current session |
| profile | User Profile | The user's basic profile that is modifiable |

### 2. User Profile (subdocument and not a collection; stored in User collection)
- The subdocument of a user profile part of the User collection
```javascript
{
    avatar: 'string' // base64 encoding
    displayName: 'string',
    email: 'string',
    isMale: 'boolean',
}
```
- Ex:

```javascript
{
    avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCAGQAlgDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAQIAAwQFBgcI/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/9oADAMBAAIQAxAAAAHlekxcfN7Wvm8xNvA9Np3ny+u7TqZdmjtY15fZr2nP39ivF5mfrDWeF2+Vtw9ZX5x+e+7fiWXtTg6tZ6kxXVfEepJCSQkkJJCSQkkJJCSQkkJJCSQkkJJCSQkkJJCSQkkIDASRZJIEIIDIEkX86bvTei9nD5tb9k1ct/Bun9j5tvivaN1eeuPX6XnxN/P5idtvB9LU7/A7OSzkZOvNc+dfmeX1V/mzy6+ixZKle9",
    displayName: 'Justin Tsang',
    email: 'justin@test.com',
    isMale: true,
}
```

| Name | Type | Description |
|------|------|-------------|
| avatar  | string | base 64 encoding of user profile image; if no image uploaded, will use a stock avatar stored in public directory of server  |
| displayName | string | A display name to represent user's name |
| email | string | The email that is associated to user |
| isMale | boolean | boolean value to identify gender of user |

### 3. Forums
- The forum collection is used to store all forums created on the website
```javascript
{
    _id: 'string',
    user: 'string', // id of user
    datePosted: 'date',
    title: 'string',
    label: ['string'],
    content: 'string',
    clothing: ['string'], // ids of referenced clothing
    likes: ['string'], // ids of users that liked
    comments: [{
        _id: 'string',
        datePosted: 'date',
        contents: 'string',
        user: 'string', // id of commenter
        likes: ['string'], // ids of users that liked
        subthreads: [comments] // schema is identical to parent comment object
    }]
}
```
- Ex:

```javascript
{
    _id: '9e4a1c14-9dd1-485b-87e8-047237020388',
    user: '7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310',
    datePosted: '2017-05-30T09:00:00',
    title: 'The new Yeezy Zebra: Buy or wait?',
    label: ['Sneaker', 'Adidas', 'Yeezy'],
    content: 'With the release of the new Yeezy Zebra, do you think I should buy now or wait for resell value to drop?',
    clothing: ['3bd10b1e-77d7-11e7-b5a5-be2e44b06b34','3bd10ed4-77d7-11e7-b5a5-be2e44b06b34'], // ids of referenced clothing
    likes: ['9e4a1c14-9dd1-485b-87e8-047237020422', '1b5d8bf6-d279-42b1-ba4e-a46b8ad55985'], // ids of users that liked
    comments: [{
        _id: '2c384c5b-a2fb-4ef3-a583-6103b025c986',
        datePosted: '2017-05-30T19:00:00',
        content: 'I think you should wait for resell to drop. The new version comes out in a month!',
        user: '1b5d8bf6-d279-42b1-ba4e-a46b8ad55985', // id of commenter
        likes: ['7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310'], // ids of users that liked
        subthreads: [comments] // schema is identical to parent comment object
    }]
}
```

| Name | Type | Description |
|------|------|-------------|
| _id  | string | A globally unique identifier to represent the forum |
| createdBy | string | The unique identifer of the user who created the forum |
| createdOn | date | A datetime of when the user created the forum |
| title | string | The title of the forum that user's will see in the landing page and will be the header of the forum |
| label | array of string | Array of strings that can tag forum to clothing type and/or brand. Allow for searchability |
| contents | string | A description of the forum and allow for a main talking point for the forum |
| clothing | array of string | Array of globally unique identifiers for the referenced clothing |
| likes | array of string | array of unique identifier of the users who likes the forum |
| comments | array of Comment | Comment users make on the forum |

### 4. Comment (subdocument and not collection, part of the Forum collection)

- A comment subdocument that is part of a forum document.  

```javascript
{
    _id: 'string',
    datePosted: 'date',
    content: 'string',
    user: 'string', // id of commenter
    likes: ['string'], // ids of users that liked
    subthreads: [comments] // schema is identical to parent comment object
}
```

- Ex:

```javascript
{
    _id: '2c384c5b-a2fb-4ef3-a583-6103b025c986',
    datePosted: '2017-05-30T19:00:00',
    content: 'I think you should wait for resell to drop. The new version comes out in a month!',
    user: '1b5d8bf6-d279-42b1-ba4e-a46b8ad55985', // id of commenter
    likes: ['7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310'], // ids of users that liked
    subthreads: [comments] // schema is identical to parent comment object
}
```

| Name | Type | Description |
|------|------|-------------|
| _id  | string | A globally unique identifier to represent the comment |
| datePosted | date | A datetime of when the comment was posted |
| contents | string | A description of the comment |
| user_id | string | A globally unique identifier of the user who posted the comment |
| likes | array | array of unique identifier of the users who likes the comment |
| subthreads | array of Comment | Replies to a comment made on forum |

### 5. Clothing

- Clothing collection that is an archive of all clothing type and brand

```javascript
{
    _id: 'string',
    url: 'string',
    snapshot: 'string', // Base 64
    label: ['string'],
    clothingType: 'int', // Enum linked to config file with types?
    prices: [{
        _id: 'string',
        dateScanned: 'date',
        price: 'int'
    }]
}
```

- Ex:

```javascript
{
    _id: 'abb04c80-85b2-44d7-8365-d88cb58bdbc3',
    url: 'https://www.amazon.com/gp/product/B01NAQ9ZBP/ref=s9_acsd_aas_bw_c_x_1_w?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-2&pf_rd_r=H31VTCP8995FQYGKASNC&pf_rd_r=H31VTCP8995FQYGKASNC&pf_rd_t=101&pf_rd_p=5a17ae6f-af2b-44a1-9c7f-e996bf8a562c&pf_rd_p=5a17ae6f-af2b-44a1-9c7f-e996bf8a562c&pf_rd_i=16613802011',
    snapshot: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7', // Base 64
    label: ['shoes'],
    clothingType: 1, // Enum linked to config file with types?
    prices: [{
        _id: 'cf4d11c7-7426-43a7-8057-9e3ec2c6cd7a',
        dateScanned: '2017-07-30T19:00:00',
        price: 19.25
    }]
}
```

| Name | Type | Description |
|------|------|-------------|
| _id  | string | A globally unique identifier to represent the clothing |
| url | string | A string url of where to scrape images and statistics for clothing. Also where to purchase item |
| snapshot | string | A base64 encoding of the image for the clothing item |
| label | array of string | an array of string of the label for the clothing type |
| clothingType | int | int value that maps the clothing type to a config file |
| prices | array of Price | Price object for the clothing type |

### 6. Price (subdocument and not collection; part of the Clothing collection)

- Price subdocument that is part of the Clothing collection

```javascript
{
    _id: 'string',
    dateScanned: 'date',
    price: 'int'
}
```

- Ex:

```javascript
{
    _id: 'cf4d11c7-7426-43a7-8057-9e3ec2c6cd7a',
    dateScanned: '2017-07-30T19:00:00',
    price: 19.25
}
```

| Name | Type | Description |
|------|------|-------------|
| _id  | string | A globally unique identifier to represent the clothing |
| dateScanned | data | The datetime of when the link was scraped and integrated into website |
| price | int | Price of the clothing |

## Project Idea
### 1. General

  - **Primary Features**:
    - Login page
    - Sign up page
    - Landing page will allow users to navigate to certain clothing type (dress, t-shirt, shoes)
    - Create threads and comments
    - View their existing forums and new notifications
  - **Reach Features**:
    - View list of most popular clothing item
    - Prioritize forums (most recent, trending, most popular)
	- Email reset password
	- Password lockout

### 2. Forum

  - **Primary Features**:
    - Create new thread to discuss certain shoe and/or clothing brand/outfit(s)
    - Users can post comments and likes for given thread
    - Use APIs to retrieve price information about clothing
    - All users can search for existing thread based on clothing type/brand
  - **Reach Features**:
    - Scrape Internet for information of sales and price of given product and update daily
    - Display graph of the daily price change
    - Allow multiple clothing items to be tracked in a single feed
    - Get list of suggestions on where to purchase given product
    - Sub threads for comments
    - Comments can contain clothing items as well

### 3. Forum Post Typing

  - **Primary Features**:
    - Tag clothing items with `#clothing_name[clothing_url]`
  - **Reach Feature**:
    - Markdown support
    - Tag users with `@user`

### 4. Clothing Selection

  - **Primary Features**:
    - Using APIs from clothing stores to get thumbnails and links to specific aritcles of clothing
    - User can select thumbnails and create a forum on them
  - **Reach Feature**:
    - User can view what forums already include this article of clothing

## Clothing Resources:
1. Amazon
  - Look into a scraper
2. Or track based on link provided by the user and scan page for prices and thumbnails

## Database Design:
1. Users
  ```javascript
    {
      _id: 'string'
      displayName: 'string',
      email: 'string',
      password: 'string', // hashed
      isMale: 'boolean',
      followedForums: ["string"], // ids of forums
      avatar: "string" // base64 encoding
    }
  ```
2. Forums
  ```javascript
    {
      _id: 'string',
      createdBy: 'string', // id of user
      createdOn: 'date',
      title: 'string',
      label: ['string'],
      contents: 'string',
      clothing: ['string'], // ids of referenced clothing
      likes: ['string'], // ids of users that liked
      comments: [{
          _id: 'string',
          datePosted: 'date',
          contents: 'string',
          user_id: 'string', // id of commenter
          likes: ['string'], // ids of users that liked
          subthreads: [comment_schema] // schema is identical to parent comment object
      } ]
    }
  ```
3. Clothing
  ```javascript
    {
      _id: 'string',
      url: 'string',
      snapshot: 'string', // Base 64
      label: 'string',
      clothingType: 'int', // Enum linked to config file with types?
      prices: [{
        _id: 'string',
        dateScanned: 'date',
        price: 'int'
      }]
    }
  ```

## Additional Tools:
1. React

**TBA**:

2. Flux (stores & dispatching)
