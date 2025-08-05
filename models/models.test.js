const {BizError, Sugar} = require('./models');


it('curDate2String', async () => {
    //  100 times
    const customDate = Sugar.curDate2String('MM/DD/YYYY');
    console.log("自定义格式转换结果:", customDate);
});

it('string2date', async () => {
    //  100 times
    const customDateStr = "08/04/2023"; // 月/日/年格式
    const customDate = Sugar.string2date(customDateStr, 'MM/DD/YYYY');
    console.log("自定义格式转换结果:", typeof (customDate));
    console.log("自定义格式转换结果:", customDate);
});

it('sleepRandom', async () => {
    //
    console.log(new Date());
    await Sugar.sleepRandom(1000, 5000);
    console.log(new Date());
});


it('beans', async () => {
    const sift = require('sift');
    //
    const list = [
        {name: 'zhangsan', age: 19, sex: 'male'},
        {name: 'lisi', age: 18, sex: 'female1'},
        {name: 'lisi', age: 19, sex: 'female2'},
        {name: 'wangwu', age: 20, sex: 'male'},
        {name: 'zhaoliu', age: 21, sex: 'female'},
        {name: 'zhaoliu', age: 21, sex: 'female'},

    ];

    // 过滤 age >= 25 或 name 以 'A' 开头的元素
    const filtered = list.filter(sift({name: 'lisi', age: 18})); // 返回 [{ name: 'Bob', age: 30 }]
    console.log(filtered);
});




