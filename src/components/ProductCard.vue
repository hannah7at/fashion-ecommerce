<template>
    <div class="card h-100">
        <img 
            :src="product.image"
            :alt="product.name"
            class="card-img-top"
        />
        <div class="card-body">
            <h5 class="card-title">{{ product.name }}</h5>
            <p class="card-text">
                Category:{{ product.category }}
            </p>
            <p class="card-text fw-bold">
                {{ product.price }}
            </p>
            <button class="btn btn-dark">
                View Details
            </button>
        </div>
    </div>
</template>
<script>
export default{
    props:{
        product:{
            type:Object,
            required:true
        }
    }
}
</script>