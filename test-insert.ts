
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Restaurant Insert...');
    // Get a valid restaurant ID first
    const { data: restaurants } = await supabase.from('restaurants').select('id').limit(1);
    if (!restaurants || restaurants.length === 0) {
        console.error('No restaurants found to test with');
    } else {
        const rid = restaurants[0].id;
        console.log(`Using restaurant ID: ${rid}`);

        const { data, error } = await supabase
            .from('restaurant_media')
            .insert({
                restaurant_id: rid,
                media_type: 'image',
                media_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                is_cover: true,
                display_order: 1
            })
            .select();

        if (error) {
            console.error('Restaurant Insert Error:', error);
        } else {
            console.log('Restaurant Insert Success:', data);
        }
    }

    console.log('\nTesting Dish Insert...');
    // Get a valid dish ID first
    const { data: dishes } = await supabase.from('dishes').select('id').limit(1);
    if (!dishes || dishes.length === 0) {
        console.error('No dishes found to test with');
    } else {
        const did = dishes[0].id;
        console.log(`Using dish ID: ${did}`);

        const { data, error } = await supabase
            .from('dish_media')
            .insert({
                dish_id: did,
                media_type: 'image',
                media_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                is_primary: true,
                sort_order: 1
            })
            .select();

        if (error) {
            console.error('Dish Insert Error:', error);
        } else {
            console.log('Dish Insert Success:', data);
        }
    }
}

test();
