export const validateMovie = (movieInfo) => {
  const {
    title,
    storyLine,
    language,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
  } = movieInfo;

  if (!title.trim()) return { error: "Başlık boş bırakılamaz!" };
  if (!storyLine.trim()) return { error: "Konu boş bırakılamaz!" };
  if (!language.trim()) return { error: "Dil boş bırakılamaz!" };
  if (!releseDate.trim()) return { error: "Çıkış tarihi boş bırakılamaz!" };
  if (!status.trim()) return { error: "Durum boş bırakılamaz!" };
  if (!type.trim()) return { error: "Kategori boş bırakılamaz!" };

  if (!genres.length) return { error: "Tür boş bırakılamaz!" };
  

  if (!tags.length) return { error: "Etiketler boş bırakılamaz!" };
  for (let tag of tags) {
    if (!tag.trim()) return { error: "Geçersiz etiketler!" };
  }

  if (!cast.length) return { error: "Ekip bilgisi boş bırakılamaz!" };
  for (let c of cast) {
    if (typeof c !== "object") return { error: "Geçersiz ekip bilgisi!" };
  }

  return { error: null };
};
