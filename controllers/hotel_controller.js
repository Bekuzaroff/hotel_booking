const Hotel = require('./../models/hotel');
const CustomError = require('./../utils/custom_error');
const async_handler = require('./../utils/async_handler');
exports.get_all_hotels = async_handler(async (req, res) => {

    let query = Hotel.find();

    //SORTING
    let sort_type = req.query.sort;
    
    if(sort_type){
        query = query.sort(sort_type);
    }else{
        query = query.sort("rating");
    }

    
    //PAGINATION
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    query = query.skip(limit * (page - 1)).limit(limit);
    

    const hotels = await query;
    res.status(200).json({
        status: 'success',
        data:{
            hotels
        }
    });
    

})

exports.get_five_rated_hotels = async_handler(async (req, res, next) => {
    const hotels = await Hotel.aggregate([
        {
            $match: {
                rating: 5.0
            },
        },
    {
        $sort: {name: 1},

    },

    ]);

    res.status(200).json({
        status: 'success',
        count: hotels.length,
        data: {
            hotels
        }
    })
});
exports.search_hotel_by_name = async_handler(async (req, res) => {
    
        let q = req.query.name;
        
        let found_hotels = await Hotel.find();

        found_hotels = found_hotels.filter((obj) => obj.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()));

        res.status(200).json({
            status: 'success',
            data: {
                found_hotels
            }
        })
        
})

exports.add_hotel_to_db = async_handler(async (req, res) => {
    
        await Hotel.create(req.body);
        
        res.status(201).json({
            status: 'success',
            message: 'hotel added successfully'
        });
    
})

exports.update_hotels_field = async_handler(async (req, res, next) => {
    
        let new_hotel = await Hotel.findByIdAndUpdate(req.query.id, req.body);


        if(!new_hotel){
            const err = new CustomError(`hotel with id ${req.params.id} does not exist`);
            next(err);
        }
        res.status(200).json({
            status: "success",
            data: {
                new_hotel
            }
        })
    
})

exports.delete_hotels_field = async_handler(async (req, res, next) => {
    
        let new_hotel = await Hotel.findByIdAndDelete(req.query.id, req.body);

        if(!new_hotel){
            const err = new CustomError(`hotel with id ${req.params.id} does not exist`);
            next(err);
        }

        res.status(200).json({
            status: "success",
            data: {
                new_hotel
            }
        })
    
})
exports.get_hotel_by_id = async_handler(async(req, res, next) => {
    
        let hotel = await Hotel.findById(req.params.id);

        if(!hotel){
            const err = new CustomError(`hotel with id ${req.params.id} does not exist`);
            next(err);
        }

        res.status(200).json({
            status: 'success',
            data: {
                hotel
            }
        })
    
})



