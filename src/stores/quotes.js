import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'

export const useQuotesStore = defineStore('quotes', {
  state: () => ({
    quotes: [],
    loading: false,
    currentQuote: null,
    initialized: false
  }),

  getters: {
    // 获取所有启用的名言
    activeQuotes: (state) => state.quotes.filter(q => q.is_active),
    
    // 获取名言总数
    totalCount: (state) => state.quotes.length,
    
    // 获取启用的名言数量
    activeCount: (state) => state.quotes.filter(q => q.is_active).length
  },

  actions: {
    // 获取用户的所有名言
    async fetchQuotes() {
      this.loading = true
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('未登录')

        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.quotes = data || []
        
        // 如果用户没有任何名言，自动创建预置名言
        if (this.quotes.length === 0 && !this.initialized) {
          await this.createDefaultQuotes()
        }
        
        this.initialized = true
        return this.quotes
      } catch (error) {
        console.error('获取名言失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建预置名言（仅在用户首次使用时）
    async createDefaultQuotes() {
      const defaultQuotes = [
        { content: '千里之行，始于足下。', author: '老子' },
        { content: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
        { content: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
        { content: '坚持就是胜利。', author: '' },
        { content: '成功的秘诀在于坚持自己的目标和信念。', author: '迪斯雷利' },
        { content: '天行健，君子以自强不息。', author: '周易' }
      ]

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const quotesToInsert = defaultQuotes.map(q => ({
          user_id: user.id,
          content: q.content,
          author: q.author,
          is_active: true
        }))

        const { error } = await supabase
          .from('quotes')
          .insert(quotesToInsert)

        if (error) throw error

        // 重新获取列表
        await this.fetchQuotes()
      } catch (error) {
        console.error('创建预置名言失败:', error)
      }
    },

    // 随机获取一条启用的名言（不重复当前显示的）
    getRandomQuote() {
      const active = this.activeQuotes
      
      if (active.length === 0) {
        return null
      }

      if (active.length === 1) {
        this.currentQuote = active[0]
        return this.currentQuote
      }

      // 如果有多条，确保不重复当前显示的
      let newQuote
      do {
        const randomIndex = Math.floor(Math.random() * active.length)
        newQuote = active[randomIndex]
      } while (this.currentQuote && newQuote.id === this.currentQuote.id)

      this.currentQuote = newQuote
      return this.currentQuote
    },

    // 添加新名言
    async addQuote(content, author = '') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('未登录')

        const { data, error } = await supabase
          .from('quotes')
          .insert([{
            user_id: user.id,
            content: content.trim(),
            author: author.trim(),
            is_active: true
          }])
          .select()

        if (error) throw error

        // 添加到本地状态
        if (data && data.length > 0) {
          this.quotes.unshift(data[0])
        }

        return data[0]
      } catch (error) {
        console.error('添加名言失败:', error)
        throw error
      }
    },

    // 更新名言
    async updateQuote(id, updates) {
      try {
        const { error } = await supabase
          .from('quotes')
          .update(updates)
          .eq('id', id)

        if (error) throw error

        // 更新本地状态
        const index = this.quotes.findIndex(q => q.id === id)
        if (index !== -1) {
          this.quotes[index] = { ...this.quotes[index], ...updates }
        }
      } catch (error) {
        console.error('更新名言失败:', error)
        throw error
      }
    },

    // 切换启用状态
    async toggleActive(id) {
      try {
        const quote = this.quotes.find(q => q.id === id)
        if (!quote) return

        await this.updateQuote(id, { is_active: !quote.is_active })
      } catch (error) {
        console.error('切换状态失败:', error)
        throw error
      }
    },

    // 删除名言
    async deleteQuote(id) {
      try {
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id)

        if (error) throw error

        // 从本地状态移除
        this.quotes = this.quotes.filter(q => q.id !== id)
        
        // 如果删除的是当前显示的名言，清除引用
        if (this.currentQuote && this.currentQuote.id === id) {
          this.currentQuote = null
        }
      } catch (error) {
        console.error('删除名言失败:', error)
        throw error
      }
    }
  }
})

