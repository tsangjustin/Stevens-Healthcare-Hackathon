const Clothing = require('../../data/').clothing;
const expect = require('chai').expect


describe('Clothing data module', () => {  
    it('should retrieve hm data', function * () {
        this.timeout(5000);
        const res = yield Clothing.retrieveClothingInfo("http://www.hm.com/us/product/72665");
        expect(res.price).to.be.eql(119);
        expect(res.image).to.be.include('http://lp.hm.com/hmprod');
    })
    it('should retrieve nike data', function * () {
        this.timeout(5000);
        const res = yield Clothing.retrieveClothingInfo("https://store.nike.com/us/en_us/pd/-/pid-10266339");
        expect(res.price).to.be.eql(25);
        expect(res.image).to.be.include('https://images.nike.com');
    })
    it('should retrieve jcrew data', function * () {
        this.timeout(5000);
        const res = yield Clothing.retrieveClothingInfo("https://www.jcrew.com/p/F5543");
        expect(res.price).to.be.eql(199.99);
        expect(res.image).to.be.include('https://www.jcrew.com');
    })
    it('should retrieve vans data', function * () {
        this.timeout(5000);
        const res = yield Clothing.retrieveClothingInfo("https://www.vans.com/shop/mens-shoes-classics/flame-sk8-hi-reissue-black-black-true-white");
        expect(res.price).to.be.eql(65);
        expect(res.image).to.be.include('https://images.vans.com');
    })
})