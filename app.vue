<script setup>
const user = useSupabaseUser()
/*
Here, we're going to need to do a few things.

First, check if cookies are stored.

If so, we need to write a 'getUserRole()' function that get's
user's set type from Db, then will render pages based on role.

else, show schedule/map component

Ie.
"'user logged in as 'Merchant'" --> Landing page at '/' will render different view component than if role == 'Vendor'
If so, get user role.

*/
</script>

<template>
    <div class="container" style="padding: 50px 0 100px 0">
    <Account v-if="user" />
    <Auth v-else />
  </div>
</template>
