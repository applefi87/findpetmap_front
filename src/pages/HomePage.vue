<!-- 沒任何想法，預計是首頁，目前沒有用到 -->
<template>
  <q-page>
    <q-banner>
      <div class="row items-center">
        <div class="col-auto">
          <q-avatar size="64px">
            <!-- <img src="./assets/logo.png" alt="Logo" /> -->
          </q-avatar>
        </div>
        <div class="col">
          <div class="text-h5">{{ t('validation.lengthMatch', { length: 999 }) }}Welcome to My Knowledge Hub</div>
          <div class="text-subtitle2">Share your knowledge and learn from others</div>
        </div>
      </div>
    </q-banner>

    <q-card>
      <q-card-section>
        <div class="text-h6">What do you want to learn or share today?</div>
        <q-input v-model="searchTerm" placeholder="Search for articles, boards, or topics" dense clearable>
          <template #append>
            <q-btn icon="search" color="primary" @click="search()" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Featured Articles</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator v-if="featuredArticles.length > 0">
          <ArticleItem v-for="(article, index) in featuredArticles" :key="index" clickable :article="article" />
        </q-list>

        <!-- No featured articles message -->
        <div class="q-pa-md" v-else>
          <div class="text-h6">No featured articles found</div>
        </div>

        <!-- Latest articles section -->
        <div class="q-my-md" v-if="latestArticles.length > 0">
          <div class="text-h5">Latest articles</div>
          <q-separator />
          <q-card class="q-my-md" v-for="(article, index) in latestArticles" :key="index" clickable tag="router-link"
            :to="{ name: 'articleDetail', params: { id: article.id } }">
            <q-card-section>
              <div class="text-h6">{{ article.title }}</div>
              <div class="text-body-1">{{ article.content }}</div>
              <div class="text-caption">{{ article.date }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- No latest articles message -->
        <div class="q-pa-md" v-else>
          <div class="text-h6">No latest articles found</div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Popular Boards</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="(board, index) in popularBoards" :key="index" clickable tag="router-link"
            :to="{ name: 'boardDetail', params: { id: board.id } }">
            <q-item-section>
              <div class="text-h6">{{ board.name }}</div>
              <div class="text-body-1">{{ board.description }}</div>
              <div class="text-caption">{{ board.articleCount }} articles</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleItem from 'components/ArticleItem.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })
// import { getFeaturedArticles, getLatestArticles } from 'src/api/article' // Import your API for getting articles

// get featured articles
// get latest articles

// Define reactive data
const featuredArticles = ref([{ id: 1, topic: 'Technology', title: 'The Latest Technology Trends You Should Know About', content: 'Technology is constantly evolving and changing, with new trends and innovations emerging every year. Here are some of the latest technology trends that you should be aware of in 2021: artificial intelligence, 5G technology, and cloud computing.', thumbnail: 'https://www.techsmith.com/blog/wp-content/uploads/2019/06/YouTube-Thumbnail-Sizes.png' }, { id: 2, topic: 'Health', title: '10 Easy Ways to Stay Healthy and Fit', content: "Staying healthy and fit doesn't have to be difficult.Here are 10 easy ways to stay healthy and fit: exercise regularly, eat a balanced diet, get enough sleep, manage stress, avoid smoking and excessive drinking, etc.", thumbnail: 'https://www.techsmith.com/blog/wp-content/uploads/2019/06/Convert-1024x495.png' }, { id: 3, topic: 'Technology', title: 'The Latest Technology Trends You Should Know About', content: 'Technology is constantly evolving and changing, with new trends and innovations emerging every year. Here are some of the latest technology trends that you should be aware of in 2021: artificial intelligence, 5G technology, and cloud computing.', thumbnail: 'https://www.techsmith.com/blog/wp-content/uploads/2019/06/YouTube-Thumbnail-Sizes.png' }, { id: 4, topic: 'Health', title: '10 Easy Ways to Stay Healthy and Fit', content: "Staying healthy and fit doesn't have to be difficult.Here are 10 easy ways to stay healthy and fit: exercise regularly, eat a balanced diet, get enough sleep, manage stress, avoid smoking and excessive drinking, etc.", thumbnail: 'https://www.techsmith.com/blog/wp-content/uploads/2019/06/Convert-1024x495.png' }])
const popularBoards = ref([{ id: 1, name: 'Sports', description: 'Discuss the latest in sports news', articleCount: 20 }, { id: 2, name: 'Technology', description: 'Stay up-to-date with the latest tech trends', articleCount: 15 }, { id: 3, name: 'Food', description: 'Share your favorite recipes and food experiences', articleCount: 12 }])
const latestArticles = ref([])
const searchTerm = ref('')

// Define methods
// const fetchFeaturedArticles = async () => {
//   try {
//     const response = await getFeaturedArticles() // Call your API to get featured articles
//     featuredArticles.value = response.data // Update the featured articles data with the response
//   } catch (error) {
//     console.error(error)
//   }
// }

// const fetchLatestArticles = async () => {
//   try {
//     const response = await getLatestArticles() // Call your API to get latest articles
//     latestArticles.value = response.data // Update the latest articles data with the response
//   } catch (error) {
//     console.error(error)
//   }
// }

const searchArticles = async () => {
  // Call your API to search for articles based on the search term
  // Update the featuredArticles and latestArticles data with the search results
}

// Fetch featured and latest articles on component mount
onMounted(() => {
  // fetchFeaturedArticles()
  // fetchLatestArticles()
})
</script>

<style lang='sass' scoped>
.q-pa-md
  padding: 24px

.q-my-md
  margin-top: 24px
  margin-bottom: 24px

.text-h5
  font-size: 24px
  font-weight: bold
  line-height: 1.2

.text-h6
  font-size: 20px
  font-weight: bold
  line-height: 1.2

.text-body-1
  font-size: 16px
  font-weight: normal
  line-height: 1.5

.text-caption
  font-size: 12px
  font-weight: normal
  line-height: 1.5
  color: #757575
</style>
