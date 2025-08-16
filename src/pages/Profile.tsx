useEffect(()=>{
  (async ()=>{
    const { data: { user }, error: uerr } = await supabase.auth.getUser()
    if (uerr) { console.error('auth.getUser error:', uerr); return }
    if (!user?.id) { nav('/auth',{replace:true}); return }

    const { data, error } = await supabase
      .from('profiles')
      .select('username,tokens,avatar')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) { setErr(error.message) }
    else {
      setUsername(data?.username ?? '')
      setTokens(data?.tokens ?? 0)
      setAvatar(data?.avatar ?? null)
    }
    setLoading(false)
  })()
},[nav])

const save = async ()=>{
  setErr(''); setOk('')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) { setErr('Няма активен потребител.'); return }

  const { error } = await supabase
    .from('profiles')
    .update({ username, avatar })
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
      setErr('Това потребителско име вече е заето. Избери друго.')
    } else {
      setErr(error.message)
    }
    return
  }
  setOk('Профилът е запазен.')
}
