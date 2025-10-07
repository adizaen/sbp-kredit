document.addEventListener('DOMContentLoaded', function() {

    // =================================================================================
    // A. DEKLARASI ELEMEN DOM
    // =================================================================================
    const creditForm = document.getElementById('creditForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const errorText = document.getElementById('errorText');
    const btnPerorangan = document.getElementById("btnPerorangan");
    const btnBadanUsaha = document.getElementById("btnBadanUsaha");
    const formPerorangan = document.getElementById("formPerorangan");
    const formBadanUsaha = document.getElementById("formBadanUsaha");
    const inputPerorangan = document.getElementById("namaPerorangan");
    const namaPemilikContainer = document.getElementById("namaPemilikContainer");
    const tambahPemilikBtn = document.getElementById("tambahPemilik");
    const subsektorInput = document.getElementById('subsektorEkonomi');
    const subsektorList = document.getElementById('subsektorList');
    const provinsiSelect = document.getElementById('provinsi');
    const kotaSelect = document.getElementById('kotaKabupaten');
    const kecamatanSelect = document.getElementById('kecamatan');
    const kelurahanSelect = document.getElementById('kelurahan');


    // =================================================================================
    // B. FUNGSI UTILITAS & HELPERS
    // =================================================================================

    /**
     * Menampilkan pesan error di UI.
     */
    function showError(message) {
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'none';
        submitBtn.disabled = false;
    }

    /**
     * Mengambil nilai dari properti objek yang bersarang (nested).
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    /**
     * Mengaktifkan/menonaktifkan semua input dalam sebuah elemen container.
     */
    function toggleInputs(container, enable) {
        container.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = !enable;
        });
    }

    /**
     * Membuat elemen upload KTP
     */
    function createKTPUploadElement(id, labelText) {
        const container = document.createElement('div');
        container.className = 'form-group ktp-upload-container';
        container.id = id;
        
        const label = document.createElement('label');
        label.textContent = labelText;
        label.setAttribute('for', `${id}_input`);
        
        const input = document.createElement('input');
        input.type = 'file';
        input.id = `${id}_input`;
        input.name = 'ktp_file';
        input.accept = 'image/*,.pdf';
        input.className = 'form-input';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.style.marginTop = '8px';
        fileInfo.style.fontSize = '14px';
        fileInfo.style.color = '#666';
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                fileInfo.textContent = `File: ${file.name} (${fileSize} MB)`;
                
                // Validasi ukuran file (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError('Ukuran file KTP maksimal 5MB');
                    input.value = '';
                    fileInfo.textContent = '';
                }
            } else {
                fileInfo.textContent = '';
            }
        });
        
        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(fileInfo);
        
        return container;
    }


    // =================================================================================
    // C. MANAJEMEN TAMPILAN FORM & UI
    // =================================================================================

    /**
     * Mereset semua tampilan tab ke kondisi awal.
     */
    function resetTabs() {
        btnPerorangan.classList.remove("active");
        btnBadanUsaha.classList.remove("active");
        formPerorangan.classList.add("hidden");
        formBadanUsaha.classList.add("hidden");
    }

    /**
     * Membersihkan area hasil, loading, dan pesan error.
     */
    function resetResultDisplay() {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }

    /**
     * Membersihkan semua nilai input pada form perorangan.
     */
    function resetFormPerorangan() {
        formPerorangan.querySelectorAll("input, textarea, select").forEach(el => {
            if (el.type !== "hidden") el.value = "";
        });
        
        // Hapus upload KTP yang lama jika ada
        const existingKTPUpload = formPerorangan.querySelector('.ktp-upload-container');
        if (existingKTPUpload) {
            existingKTPUpload.remove();
        }
        
        // Tambahkan upload KTP baru
        const ktpUpload = createKTPUploadElement('ktpPeroranganUpload', 'Upload KTP');
        const namaInput = formPerorangan.querySelector('#namaPerorangan').closest('.form-group');
        namaInput.parentNode.insertBefore(ktpUpload, namaInput.nextSibling);
        
        inputPerorangan.focus();
    }

    /**
     * Membersihkan dan mereset form badan usaha.
     */
    function resetFormBadanUsaha() {
        namaPemilikContainer.innerHTML = "";
        const defaultDiv = document.createElement("div");
        defaultDiv.className = "dynamic-input";
        const defaultInput = document.createElement("input");
        defaultInput.type = "text";
        defaultInput.name = "namaPemilik[]";
        defaultInput.placeholder = "Nama Pemilik";
        defaultInput.className = "form-input";
        defaultInput.required = true;
        defaultDiv.appendChild(defaultInput);
        namaPemilikContainer.appendChild(defaultDiv);
        formBadanUsaha.querySelectorAll("input, textarea, select").forEach(el => {
            if (!el.closest("#namaPemilikContainer") && el.type !== "hidden") {
                el.value = "";
            }
        });
        
        // Hapus upload KTP yang lama jika ada
        const existingKTPUpload = formBadanUsaha.querySelector('.ktp-upload-container');
        if (existingKTPUpload) {
            existingKTPUpload.remove();
        }
        
        // Tambahkan upload KTP baru
        const ktpUpload = createKTPUploadElement('ktpBadanUsahaUpload', 'Upload KTP Pemilik');
        const namaUsahaInput = formBadanUsaha.querySelector('#namaUsaha').closest('.form-group');
        namaUsahaInput.parentNode.insertBefore(ktpUpload, namaUsahaInput.nextSibling);
        
        defaultInput.focus();
    }

    /**
     * Menambahkan input field baru untuk nama pemilik.
     */
    function tambahPemilik() {
        const newInputDiv = document.createElement("div");
        newInputDiv.className = "dynamic-input";
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.name = "namaPemilik[]";
        newInput.placeholder = "Nama Pemilik";
        newInput.className = "form-input";
        const hapusBtn = document.createElement("button");
        hapusBtn.type = "button";
        hapusBtn.innerHTML = "✕";
        hapusBtn.className = "delete";
        hapusBtn.addEventListener("click", () => newInputDiv.remove());
        newInputDiv.appendChild(newInput);
        newInputDiv.appendChild(hapusBtn);
        namaPemilikContainer.appendChild(newInputDiv);
        newInput.focus();
    }


    // =================================================================================
    // D. DROPDOWN (SUBSEKTOR & WILAYAH)
    // =================================================================================
    const subsektorEkonomi = [
        "Pertanian Padi", "Pertanian Jagung", "Pertanian Aneka Umbi Palawija", "Pertanian Kacang Tanah", "Pertanian Kedelai", 
        "Pertanian Serealia Lainnya, Aneka Kacang Dan Biji-Bijian Penghasil Minyak Lainnya", "Pertanian Bit Gula Dan Tanaman Pemanis Bukan Tebu", 
        "Perkebunan Tebu", "Perkebunan Tembakau", "Perkebunan Karet Dan Tanaman Penghasil Getah Lainnya", "Pertanian Tanaman Berserat", 
        "Perkebunan Tanaman Obat / Bahan Farmasi", "Perkebunan Tanaman Aromatik/Penyegar", "Pertanian Tanaman Semusim Lainnya Ytdl", 
        "Perkebunan Buah Oleaginous Lainnya", "Pertanian Hortikultura Bawang Merah", "Pertanian Sayuran, Buah Dan Aneka Umbi Lainnya", 
        "Pertanian Tanaman Bunga", "Pertanian Tanaman Hias", "Pertanian Pembibitan Tanaman Bunga", "Pertanian Pengembangbiakan Tanaman", 
        "Pertanian Buah Jeruk", "Pertanian Buah-Buahan Tropis Dan Subtropis Lainnya", "Pertanian Buah Apel Dan Buah Batu (Pome And Stone Fruits)", 
        "Pertanian Buah Pisang", "Perkebunan Buah Kelapa", "Perkebunan Buah Kelapa Sawit", "Perkebunan Tanaman Kopi", "Perkebunan Tanaman Teh", 
        "Perkebunan Tanaman Coklat (Kakao)", "Pertanian Sayuran Dan Buah Semak Dan Buah Biji Kacang-Kacangan Lainnya", "Perkebunan Lada", 
        "Perkebunan Cengkeh", "Perkebunan Tanaman Rempah Panili", "Perkebunan Tanaman Rempah Pala", "Perkebunan Tanaman Rempah Yang Tidak Diklasifikasikan Di Tempat Lain", 
        "Pertanian Cabai", "Pembibitan Dan Budidaya Sapi Potong", "Pembibitan Dan Budidaya Kerbau Potong", "Peternakan Domba Dan Kambing", 
        "Pembibitan Dan Budidaya Sapi Perah", "Pembibitan Dan Budidaya Kerbau Perah", "Peternakan Babi", "Peternakan Unggas", "Peternakan Lainnya", 
        "Jasa Penunjang Pertanian Dan Pasca Panen", "Perburuan, Penangkapan Dan Penangkaran Tumbuhan/ Satwa Liar", "Pengusahaan Hutan Tanaman", 
        "Pengusahaan Hutan Alam", "Pengusahaan Hasil Hutan Bukan Kayu", "Jasa Penunjang Kehutanan", "Pengusahaan Pembibitan Tanaman Kehutanan", 
        "Usaha Kehutanan Lainnya", "Penangkapan Ikan Tuna", "Penangkapan Ikan Lainnya", "Penangkapan Udang Laut", "Penangkapan Crustacea Lainnya Di Laut", 
        "Penangkapan Biota Air Lainnya Di Laut", "Jasa Penangkapan Ikan Di Laut", "Jasa Penangkapan Ikan Di Perairan Umum", "Budidaya Biota Laut Udang", 
        "Budidaya Biota Laut Lainnya", "Budidaya Biota Laut Rumput Laut", "Penangkapan Pisces/Ikan Bersirip Di Perairan Umum", "Penangkapan Biota Air Lainnya Di Perairan Umum", 
        "Budidaya Biota Air Tawar Udang", "Pembenihan Ikan Air Tawar", "Budidaya Biota Air Tawar Lainnya", "Budidaya Biota Air Payau Udang", "Budidaya Biota Air Payau Lainnya", 
        "Jasa Budidaya Ikan Laut", "Jasa Budidaya Ikan Air Tawar", "Jasa Budidaya Ikan Air Payau", "Ekstraksi Garam", "Industri Pengolahan Dan Pengawetan Daging", 
        "Industri Pengolahan Dan Pengawetan Ikan Dan Biota Air", "Industri Pengolahan Dan Pengawetan Lainnya Buah-Buahan Dan Sayuran", "Industri Minyak Dan Lemak Nabati Dan Hewani", 
        "Industri Minyak Mentah Dan Lemak Nabati Dan Hewani Lainnya", "Industri Minyak Mentah Kelapa & Minyak Goreng Kelapa", 
        "Industri Minyak Mentah/Murni Kelapa Sawit (Crude Palm Oil) Dan Minyak Goreng Kelapa Sawit", "Industri Pengolahan Susu, Produk Dari Susu Dan Es Krim", 
        "Industri Penggilingan Beras Dan Jagung Dan Industri Tepung Beras Dan Jagung", "Industri Kopra, Tepung & Pelet Kelapa", 
        "Industri Penggilingan Serelia Dan Biji-Bijian Lainnya (Bukan Beras Dan Jagung)", "Industri Pati Dan Produk Pati (Bukan Beras Dan Jagung)", "Industri Makanan Hewan", 
        "Industri Produk Roti Dan Kue", "Industri Gula", "Industri Kakao, Cokelat Dan Kembang Gula", "Industri Makaroni, Mie Dan Produk Sejenisnya", "Industri Pengolahan Teh", 
        "Industri Pengolahan Kopi", "Industri Kecap", "Industri Tempe & Tahu Kedelai", "Industri Produk Makanan Lainnya", "Industri Minuman", "Industri Pengolahan Tembakau Lainnya", 
        "Industri Rokok Dan Produk Tembakau Lainnya", "Industri Pemintalan, Penenunan Dan Penyelesaian Akhir Tekstil", "Industri Tekstil Lainnya", 
        "Industri Pakaian Jadi Rajutan Dan Sulaman/Bordir", "Industri Pakaian Jadi Dan Perlengkapannya, Bukan Pakaian Jadi Dari Kulit Berbulu", 
        "Industri Pakaian Jadi Dan Barang Dari Kulit Berbulu", "Industri Kulit Dan Barang Dari Kulit, Termasuk Kulit Buatan", "Industri Alas Kaki", 
        "Industri Penggergajian Dan Pengawetan Kayu, Rotan, Bambu Dan Sejenisnya", "Industri Kayu Lapis, Veneer Dan Sejenisnya", 
        "Industri Barang Lainnya Dari Kayu; Industri Barang Dari Gabus Dan Barang Anyaman Dari Jerami, Rotan, Bambu Dan Sejenisnya", "Industri Bubur Kertas, Kertas Dan Papan Kertas", 
        "Industri Kertas Dan Papan Kertas Bergelombang Dan Wadah Dari Kertas Dan Papan Kertas", "Industri Barang Dari Kertas Dan Papan Kertas Lainnya", "Aktivitas Penerbitan", 
        "Aktivitas Perekaman Suara Dan Penerbitan Musik", "Industri Pencetakan Dan Kegiatan Ybdi", "Reproduksi Media Rekaman", "Industri Produk Dari Batu Bara", 
        "Industri Bahan Bakar Dan Minyak Pelumas Hasil Pengilangan Minyak Bumi", "Industri Pengolahan Uranium Dan Bijih Uranium", "Industri Kimia Dasar", 
        "Industri Pupuk Dan Bahan Senyawa Nitrogen", "Industri Plastik Dan Karet Buatan Dalam Bentuk Dasar", "Industri Pestisida Dan Produk Agrokimia Lainnya", 
        "Industri Cat Dan Tinta Cetak, Pernis Dan Bahan Pelapisan Sejenisnya Dan Lak", "Industri Farmasi, Produk Obat Kimia Dan Obat Tradisional", 
        "Industri Sabun Dan Deterjen, Bahan Pembersih Dan Pengilap, Parfum Dan Kosmetik", "Industri Minyak Atsiri", "Industri Barang Kimia Lainnya Ytdl", "Industri Serat Buatan", 
        "Industri Pengasapan Karet", "Industri Remilling Karet", "Industri Karet Remah (Crumb Rubber)", "Industri Barang Dari Karet Lainnya", "Industri Barang Dari Plastik", 
        "Industri Kaca Dan Barang Dari Kaca", "Industri Barang Porselen Bukan Bahan Bangunan", "Industri Barang Tanah Liat/Keramik Bukan Bahan Bangunan", 
        "Industri Bahan Bangunan Dari Tanah Liat/Keramik", "Industri Semen, Kapur Dan Gips", "Industri Barang Dari Batu", "Industri Barang Galian Bukan Logam Lainnya Ytdl", 
        "Industri Logam Dasar Besi Dan Baja", "Industri Logam Dasar Mulia Dan Logam Dasar Bukan Besi Lainnya", "Industri Pengecoran Besi Dan Baja", 
        "Industri Pengecoran Logam Bukan Besi Dan Baja", "Industri Barang Logam Siap Pasang Untuk Bangunan, Tangki, Tandon Air Dan Generator Uap", 
        "Industri Alat Potong, Perkakas Tangan Dan Peralatan Umum", "Industri Barang Logam Lainnya Ytdl", "Industri Mesin Untuk Keperluan Umum", 
        "Reparasi Dan Pemasangan Mesin Dan Peralatan", "Industri Mesin Pertanian Dan Kehutanan", "Industri Mesin Penambangan, Penggalian Dan Konstruksi", 
        "Industri Mesin Pengolahan Makanan, Minuman Dan Tembakau", "Industri Mesin Tekstil, Pakaian Jadi Dan Produk Kulit", "Industri Mesin Keperluan Khusus Lainnya", 
        "Industri Peralatan Rumah Tangga", "Industri Komputer Dan Perlengkapannya", "Industri Motor Listrik, Generator Dan Transformator", 
        "Industri Peralatan Pengontrol Dan Pendistribusian Listrik", "Industri Kabel Dan Perlengkapannya", "Industri Batu Baterai Dan Akumulator Listrik", 
        "Industri Peralatan Penerangan Listrik (Termasuk Peralatan Penerangan Bukan Listrik)", "Industri Peralatan Listrik Lainnya", "Industri Komponen Dan Papan Elektronik", 
        "Industri Peralatan Komunikasi", "Industri Peralatan Audio Dan Video Elektronik", "Industri Alat Ukur, Alat Uji, Peralatan Navigasi Dan Kontrol", 
        "Industri Peralatan Iradiasi, Elektromedikal Dan Elektroterapi", "Industri Peralatan Fotografi Dan Instrumen Optik Bukan Kaca Mata", 
        "Industri Komputer, Barang Elektronik Dan Optik Lainnya", "Industri Pengolahan Lainnya", "Industri Alat Ukur Waktu", 
        "Industri Kendaraan Bermotor Roda Empat Atau Lebih", "Industri Karoseri Kendaraan Bermotor Roda Empat Atau Lebih Dan Industri Trailer Dan Semi Trailer", 
        "Industri Suku Cadang Dan Aksesori Kendaraan Bermotor Roda Empat Atau Lebih", "Industri Pembuatan Kapal Dan Perahu", "Industri Lokomotif Dan Gerbong Kereta", 
        "Industri Pesawat Terbang Dan Perlengkapannya", "Industri Sepeda Motor Roda Dua Dan Tiga", "Industri Alat Angkutan Lainnya Ytdl", "Industri Furnitur", 
        "Pengelolaan Dan Daur Ulang Sampah", "Penyiapan Tanah Pemukiman Transmigrasi (Ptpt)", "Pencetakan Lahan Sawah", "Penyiapan Lahan Lainnya Dan Pembongkaran", 
        "Konstruksi Perumahan Sederhana Bank Tabungan Negara", "Konstruksi Perumahan Sederhana Perumnas", "Konstruksi Perumahan Sederhana Lainnya Tipe S.D. 21", 
        "Konstruksi Perumahan Sederhana Lainnya Tipe 22 S.D. 70", "Konstruksi Perumahan Menengah, Besar, Mewah (Tipe Diatas 70)", "Konstruksi Gedung Perkantoran", 
        "Konstruksi Gedung Industri", "Konstruksi Gedung Perbelanjaan Pasar Inpres", "Konstruksi Gedung Perbelanjaan Lainnya", "Konstruksi Gedung Tempat Tinggal Lainnya", 
        "Konstruksi Gedung Lainnya", "Konstruksi Jalan Raya Selain Tol", "Konstruksi Jalan Tol", "Konstruksi Jembatan Dan Jalan Layang", "Konstruksi Jalan Raya Lainnya", 
        "Konstruksi Jalan Rel Dan Jembatan Rel", "Konstruksi Jaringan Irigasi", "Konstruksi Bangunan Pelabuhan Bukan Perikanan", "Konstruksi Bangunan Sipil Lainnya Ytdl", 
        "Konstruksi Bangunan Listrik Pedesaan", "Konstruksi Bangunan Elektrikal Dan Komunikasi Lainnya", "Konstruksi Jaringan Elektrikal Dan Telekomunikasi Lainnya", 
        "Konstruksi Khusus Lainnya Ytdl", "Instalasi Sistem Kelistrikan, Air (Pipa) Dan Instalasi Konstruksi Lainnya", "Penyelesaian Konstruksi Bangunan", 
        "Penyewaan Alat Konstruksi Dengan Operator", "Perdagangan Mobil", "Perdagangan Suku Cadang Dan Aksesori Mobil", "Perdagangan Sepeda Motor", 
        "Perdagangan Suku Cadang Sepeda Motor Dan Aksesorinya", "Perdagangan Eceran Khusus Bahan Bakar Kendaraan Bermotor", 
        "Perdagangan Besar Atas Dasar Balas Jasa (Fee) Atau Kontrak", "Perdagangan Besar Jagung", "Perdagangan Besar Tembakau Rajangan", "Perdagangan Karet", 
        "Perdagangan Cengkeh", "Perdagangan Lada", "Perdagangan Besar Buah Yang Mengandung Minyak", "Perdagangan Biji Kelapa Sawit", "Perdagangan Kapas", 
        "Perdagangan Besar Padi Dan Palawija Lainnya", "Perdagangan Besar Hasil Pertanian Dan Hewan Hidup Lainnya", "Perdagangan Besar Binatang Hidup", 
        "Perdagangan Besar Hasil Perikanan", "Perdagangan Kayu", "Perdagangan Besar Hasil Kehutanan Dan Perburuan Lainnya", "Perdagangan Besar Beras", 
        "Perdagangan Besar Gula, Coklat Dan Kembang Gula", "Perdagangan Besar Kopi", "Perdagangan Besar Teh", "Perdagangan Besar Makanan Dan Minuman Lainnya", 
        "Perdagangan Besar Minyak Dan Lemak Nabati", "Perdagangan Besar Bahan Makanan Dan Minuman Hasil Pertanian Lainnya", "Perdagangan Besar Rokok Dan Tembakau", 
        "Perdagangan Besar Bahan Makanan Dan Minuman Hasil Peternakan Dan Perikanan Lainnya", "Perdagangan Besar Tekstil", "Perdagangan Besar Barang Keperluan Rumah Tangga Lainnya", 
        "Perdagangan Besar Bahan Bakar Padat, Cair Dan Gas Dan Produk Ybdi", "Perdagangan Besar Logam Dan Bijih Logam", "Perdagangan Besar Bahan Konstruksi Lainnya", 
        "Perdagangan Besar Bahan Konstruksi Dari Kayu", "Perdagangan Besar Pupuk Dan Produk Agrokimia", "Perdagangan Besar Barang Bekas Dan Sisa-Sisa Tak Terpakai (Scrap)", 
        "Perdagangan Besar Produk Lainnya Ytdl", "Perdagangan Besar Kertas Dan Karton", "Perdagangan Besar Alat Laboratorium, Farmasi Dan Kedokteran", 
        "Perdagangan Eceran Yang Utamanya Makanan, Minuman Atau Tembakau Di Toko", "Perdagangan Eceran Berbagai Macam Barang Yang Didominasi Oleh Barang Bukan Makanan Dan Tembakau Di Toko", 
        "Perdagangan Eceran Khusus Komoditi Makanan Dari Hasil Pertanian Di Toko", "Perdagangan Eceran Khusus Makanan, Minuman Dan Tembakau Lainnya Di Toko", 
        "Perdagangan Eceran Khusus Bahan Kimia, Barang Farmasi, Alat Kedokteran, Parfum Dan Kosmetik Di Toko", "Perdagangan Eceran Khusus Tekstil Di Toko", 
        "Perdagangan Eceran Khusus Pakaian, Alas Kaki Dan Barang Dari Kulit Di Toko", 
        "Perdagangan Eceran Khusus Furnitur, Peralatan Listrik Rumah Tangga, Peralatan Penerangan Dan Peralatan Rumah Tangga Lainnya Di Toko", "Perdagangan Eceran Khusus Barang Baru Lainnya Di Toko", 
        "Perdagangan Eceran Khusus Peralatan Informasi Dan Komunikasi Di Toko", "Perdagangan Eceran Khusus Barang Budaya Dan Rekreasi Di Toko Khusus", 
        "Perdagangan Eceran Khusus Barang Dan Bahan Bangunan, Cat Dan Kaca Di Toko", "Perdagangan Eceran Bahan Bakar Bukan Bahan Bakar Untuk Kendaraan Bermotor Di Toko", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Kertas, Barang Dari Kertas, Alat Tulis, Barang Cetakan, Alat Olahraga, Alat Musik, Alat Fotografi Dan Komputer", 
        "Perdagangan Eceran Khusus Barang Lainnya Ytdl", "Perdagangan Eceran Barang Kerajinan Dan Lukisan Di Toko", "Perdagangan Eceran Khusus Barang Bekas Di Toko", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Komoditi Hasil Pertanian", "Perdagangan Eceran Kaki Lima Dan Los Pasar Makanan, Minuman Dan Produk Tembakau Hasil Industri Pengolahan", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Bahan Kimia, Farmasi, Kosmetik Dan Ybdi", "Perdagangan Eceran Kaki Lima Dan Los Pasar Tekstil, Pakaian Dan Alas Kaki", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Perlengkapan Rumah Tangga", "Perdagangan Eceran Kaki Lima Dan Los Pasar Bahan Bakar Minyak, Gas, Minyak Pelumas Dan Bahan Bakar Lainnya", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Barang Kerajinan, Mainan Anak-Anak Dan Lukisan", "Perdagangan Eceran Kaki Lima Dan Los Pasar Barang Bekas Perlengkapan Rumah Tangga", 
        "Perdagangan Eceran Kaki Lima Dan Los Pasar Barang Lainnya", "Perdagangan Eceran Melalui Pemesanan Pos Atau Internet", "Perdagangan Eceran Bukan Di Toko, Kios, Kaki Lima Dan Los Pasar Lainnya", 
        "Perdagangan Beser Udang Olahan", "Perdagangan Besar Pakaian", "Perdagangan Besar Kulit Dan Kulit Jangat", "Perdagangan Besar Tekstil, Pakaian Dan Alas Kaki Lainnya", "Perdagangan Besar Alas Kaki", 
        "Hotel Bintang", "Hotel Melati", "Penyediaan Akomodasi Lainnya", "Penyediaan Makanan Dan Minuman Lainnya", "Restoran Dan Rumah Makan", "Angkutan Jalan Rel Wisata", "Angkutan Jalan Rel Lainnya", 
        "Angkutan Jalan Rel", "Angkutan Bus Bertrayek", "Angkutan Darat Bukan Bus Untuk Penumpang, Bertrayek", "Angkutan Bus Pariwisata", "Angkutan Bus Tidak Bertrayek Lainnya", 
        "Angkutan Darat Lainnya Untuk Penumpang", "Angkutan Darat Untuk Barang", "Angkutan Melalui Saluran Pipa", "Angkutan Laut Untuk Wisata", "Angkutan Laut Dalam Negeri Untuk Penumpang Selain Wisata", 
        "Angkutan Laut Dalam Negeri Untuk Barang", "Angkutan Laut Luar Negeri Untuk Penumpang", "Angkutan Laut Luar Negeri Untuk Barang", "Angkutan Sungai Dan Danau Untuk Wisata Dan Ybdi", 
        "Angkutan Sungai, Danau Dan Penyeberangan Untuk Barang", "Angkutan Penyeberangan Untuk Penumpang", "Angkutan Udara Berjadwal Untuk Penumpang", "Angkutan Udara Untuk Barang", 
        "Angkutan Udara Tidak Berjadwal Untuk Penumpang", "Angkutan Udara Untuk Penumpang Lainnya", "Aktivitas Profesional, Ilmiah Dan Teknis Lainnya", "Aktivitas Penunjang Angkutan", 
        "Pergudangan Dan Penyimpanan", "Aktivitas Konsultasi Pariwisata", "Aktivitas Agen Perjalanan Wisata", "Aktivitas Biro Perjalanan Wisata", "Jasa Reservasi Lainnya Dan Kegiatan Ybdi", 
        "Penyelenggara Konvensi Dan Pameran Dagang", "Jasa Impresariat Bidang Seni", "Aktivitas Pos Dan Kurir", "Aktivitas Telekomunikasi Dengan Kabel, Tanpa Kabel Dan Satelit", 
        "Jasa Nilai Tambah Teleponi Dan Jasa Multimedia", "Portal Web Dan/Atau Platform Digital Tanpa Tujuan Komersial", "Portal Web Dan/Atau Platform Digital Dengan Tujuan Komersial", 
        "Aktivitas Telekomunikasi Lainnya Ytdl", "Real Estate Perumahan Sederhana Perumnas", "Real Estate Perumahan Sederhana Perumnas Tipe 21", "Real Estate Perumahan Sederhana Perumnas Tipe 22 S.D. 70", 
        "Real Estate Perumahan Menengah, Besar Atau Mewah (Tipe Diatas 70)", "Real Estate Perumahan Flat / Apartemen", "Real Estate Gedung Perbelanjaan (Mal, Plaza)", "Real Estate Gedung Perkantoran", 
        "Real Estate Gedung Rumah Toko (Ruko) Atau Rumah Kantor (Rukan)", "Real Estate Lainnya", "Kawasan Industri", "Real Estat Atas Dasar Balas Jasa (Fee) Atau Kontrak", "Kawasan Pariwisata", 
        "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Mobil, Bus, Truk Dan Sejenisnya", "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Alat Transportasi Darat Bukan Kendaraan Bermotor Roda Empat Atau Lebih", 
        "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Alat Transportasi Air", "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Alat Transportasi Udara", 
        "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Mesin Pertanian Dan Peralatannya", "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Mesin Dan Peralatan Konstruksi Dan Teknik Sipil", 
        "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Mesin Kantor Dan Peralatannya", "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Mesin, Peralatan Dan Barang Berwujud Lainnya Ytdl", 
        "Aktivitas Penyewaan Dan Sewa Guna Usaha Tanpa Hak Opsi Barang Pribadi Dan Rumah Tangga", "Aktivitas Konsultasi Komputer Dan Manajemen Fasilitas Komputer", "Aktivitas Pemrograman Komputer", "Aktivitas Pengolahan Data", 
        "Aktivitas Hosting Dan Ybdi", "Reparasi Komputer Dan Barang Keperluan Pribadi Dan Perlengkapan Rumah Tangga", "Penelitian Dan Pengembangan Ilmu Pengetahuan Alam Dan Ilmu Teknologi Dan Rekayasa", 
        "Penelitian Dan Pengembangan Ilmu Pengetahuan Sosial Dan Humaniora", "Aktivitas Hukum Dan Akuntansi", "Aktivitas Kantor Pusat Dan Konsultasi Manajemen Lainnya", "Periklanan Dan Penelitian Pasar", 
        "Aktivitas Arsitektur Dan Keinsinyuran; Analisis Dan Uji Teknis", "Aktivitas Jasa Penunjang Usaha Ytdl", "Aktivitas Agen Perjalanan Bukan Wisata", "Aktivitas Jasa Informasi Lainnya Ytdl", "Aktivitas Ketenagakerjaan", 
        "Kegiatan Penunjang Pendidikan", "Pendidikan Dasar Dan Pendidikan Anak Usia Dini", "Pendidikan Menengah", "Pendidikan Tinggi", "Pendidikan Lainnya", "Aktivitas Rumah Sakit", "Aktivitas Pelayanan Kesehatan Manusia Lainnya", 
        "Aktivitas Praktik Dokter Dan Dokter Gigi", "Aktivitas Kesehatan Hewan", "Aktivitas Sosial", "Pengelolaan Air Limbah", "Aktivitas Remediasi Dan Pengelolaan Sampah Lainnya", "Aktivitas Organisasi Bisnis, Pengusaha Dan Profesi", 
        "Aktivitas Organisasi Buruh", "Aktivitas Organisasi Keanggotaan Lainnya Ytdl", "Aktivitas Hiburan, Seni Dan Kreativitas Lainnya", "Aktivitas Penyiaran Dan Pemrograman", "Aktivitas Produksi Gambar Bergerak, Video Dan Program Televisi", 
        "Aktivitas Kantor Berita", "Perpustakaan Dan Arsip", "Museum Dan Operasional Bangunan Dan Situs Bersejarah", "Aktivitas Olahraga Dan Rekreasi Lainnya", "Reparasi Dan Perawatan Mobil", "Reparasi Dan Perawatan Sepeda Motor", 
        "Aktivitas Panti Pijat Dan Spa", "Aktivitas Jasa Perorangan Lainnya", "Rumah Tangga Untuk Pemilikan Rumah Tinggal S.D. Tipe 21", "Rumah Tangga Untuk Pemilikan Rumah Tinggal Tipe Diatas 21 S.D. 70", 
        "Rumah Tangga Untuk Pemilikan Rumah Tinggal Tipe Diatas 70", "Rumah Tangga Untuk Pemilikan Flat Atau Apartemen S.D. Tipe 21", "Rumah Tangga Untuk Pemilikan Flat Atau Apartemen Tipe Diatas 21 S.D. 70", 
        "Rumah Tangga Untuk Pemilikan Flat Atau Apartemen Tipe Diatas 70", "Rumah Tangga Untuk Pemilikan Rumah Toko (Ruko) Atau Rumah Kantor (Rukan)", "Rumah Tangga Untuk Pemilikan Mobil Roda Empat", "Rumah Tangga Untuk Pemilikan Sepeda Bermotor", 
        "Rumah Tangga Untuk Pemilikan Truk Dan Kendaraan Bermotor Roda Enam Atau Lebih", "Rumah Tangga Untuk Pemilikan Kendaraan Bermotor Lainnya", "Rumah Tangga Untuk Pemilikan Furnitur Dan Peralatan Rumah Tangga", 
        "Rumah Tangga Untuk Pemilikan Televisi, Radio, Dan Alat Elektronik", "Rumah Tangga Untuk Pemilikan Komputer Dan Alat Komunikasi", "Rumah Tangga Untuk Pemilikan Peralatan Lainnya", 
        "Rumah Tangga Untuk Keperluan Multiguna Beragunan Rumah Tinggal S.D Tipe 21", "Rumah Tangga Untuk Keperluan Multiguna Beragunan Rumah Tinggal Tipe Diatas 21 S.D 70", "Rumah Tangga Untuk Keperluan Multiguna Beragunan Rumah Tinggal Tipe Diatas 70", 
        "Rumah Tangga Untuk Keperluan Multiguna Beragunan Apartemen S.D Tipe 21", "Rumah Tangga Untuk Keperluan Multiguna Beragunan Apartemen Tipe 22 S.D 70", "Rumah Tangga Untuk Keperluan Multiguna Beragunan Apartemen Tipe Diatas 70", 
        "Rumah Tangga Untuk Keperluan Multiguna Beragunan Ruko/Rukan", "Rumah Tangga Untuk Keperluan Multiguna Lainnya", "Rumah Tangga Untuk Keperluan Yang Tidak Diklasifikasikan Di Tempat Lain", "Bukan Lapangan Usaha Lainnya", "Pertambangan Batu Bara Dan Lignit",
        "Industri Briket Batu Bara", "Pertambangan Minyak Bumi Dan Gas Alam", "Pengusahaan Tenaga Panas Bumi", "Aktivitas Penunjang Pertambangan Minyak Bumi Dan Gas Alam", "Aktivitas Penunjang Pertambangan Dan Penggalian Lainnya", 
        "Pertambangan Bijih Uranium Dan Thorium", "Pertambangan Bijih Timah", "Pertambangan Bijih Bauksit/Aluminium", "Pertambangan Bijih Tembaga", "Pertambangan Bijih Nikel", "Pertambangan Emas", "Pertambangan Perak", 
        "Pertambangan Bahan Galian Lainnya Yang Tidak Mengandung Bijih Besi", "Pertambangan Bijih Logam Mulia Lainnya", "Pertambangan Mineral, Bahan Kimia Dan Bahan Pupuk", "Pertambangan Dan Penggalian Lainnya Ytdl", "Pertambangan Pasir Besi Dan Bijih Besi", 
        "Penggalian Batu, Pasir Dan Tanah Liat", "Ketenagalistrikan Pedesaan", "Ketenagalistrikan Lainnya", "Pengadaan Dan Distribusi Gas Alam Dan Buatan", "Pengadaan Uap/Air Panas, Udara Dingin Dan Produksi Es", "Pengelolaan Air"
    ];

    let currentFocusIndex = -1;

    function showDropdownOptions(searchTerm) {
        const filtered = subsektorEkonomi.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
        subsektorList.innerHTML = '';
        currentFocusIndex = -1;
        if (filtered.length > 0) {
            filtered.slice(0, 10).forEach(option => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.textContent = option;
                div.addEventListener('mousedown', () => selectSubsektor(option));
                subsektorList.appendChild(div);
            });
            subsektorList.style.display = 'block';
        } else {
            subsektorList.style.display = 'none';
        }
    }

    function updateHighlight(items) {
        items.forEach((item, i) => item.classList.toggle('highlighted', i === currentFocusIndex));
    }

    function selectSubsektor(value) {
        subsektorInput.value = value;
        subsektorList.style.display = 'none';
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error("Fetch Error:", e);
            showError('Gagal memuat data wilayah. Periksa koneksi internet Anda.');
            return null;
        }
    }

    function populateSelect(selectEl, data, valueKey, nameKey, placeholder) {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        if (data && Array.isArray(data)) {
            data.sort((a, b) => a[nameKey].localeCompare(b[nameKey])).forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueKey];
                option.textContent = item[nameKey];
                selectEl.appendChild(option);
            });
        }
        selectEl.disabled = false;
    }

    function resetSelect(selectEl, placeholder) {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = true;
    }

    /**
     * Merender data hasil screening ke dalam tabel HTML.
     * Fungsi ini sekarang berisi logika untuk mentransformasi JSON mentah
     * agar sesuai dengan format yang diharapkan oleh 'tableConfigs'.
     */
    function renderResults(data) {
        // --- AWAL BLOK TRANSFORMASI DATA ---
        const rawData = Array.isArray(data) ? data[0] : data;
        if (!rawData) {
            showError("Tidak ada data yang diterima untuk ditampilkan.");
            return;
        }

        // 'obj' adalah objek baru yang akan kita buat agar strukturnya cocok dengan tableConfigs
        const obj = {};
        
        // Ambil nama subjek dari form input untuk ditampilkan di ringkasan
        const subjectName = btnPerorangan.classList.contains('active')
            ? document.getElementById('namaPerorangan').value.trim()
            : (document.querySelector('input[name="namaPemilik[]"]')?.value.trim() || document.getElementById('namaUsaha').value.trim());

        // Fungsi bantuan untuk menormalisasi status (Tidak perlu diubah)
        function normalizeStatus(status) {
            if (!status) return "tidak ditemukan";
            const normalized = status.toString().toLowerCase().trim();
            return normalized.includes("ditemukan") && !normalized.includes("tidak") ? "ditemukan" : "tidak ditemukan";
        }
        
        const formatHukumDetail = (hukumData) => {
            if (!hukumData || !hukumData.keterlibatan_hukum || normalizeStatus(hukumData.keterlibatan_hukum) === 'tidak ditemukan') return '-';
            
            let detailHtml = `<p>${hukumData.alasan_keterlibatan_hukum || 'Tidak ada ringkasan.'}</p>`;
            if (hukumData.peran_tercatat && hukumData.peran_tercatat.length > 0) {
                hukumData.peran_tercatat.forEach(item => {
                    const links = item.tautan_sumber ? item.tautan_sumber.map(linkUrl => {
                        const sourceInfo = hukumData.daftar_sumber?.find(s => s.url === linkUrl);
                        const publisherName = sourceInfo ? sourceInfo.sumber : (new URL(linkUrl)).hostname.replace('www.','');
                        return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${publisherName}</a>`;
                    }).join('<br>') : 'Tidak ada';
                    
                    detailHtml += `
                        <table class="detail-item-table key-value-table">
                            <thead><tr><th>Properti</th><th>Detail</th></tr></thead>
                            <tbody>
                                <tr><td>Peran</td><td>${item.peran || '-'}</td></tr>
                                <tr><td>Ringkasan</td><td>${item.ringkasan || '-'}</td></tr>
                                <tr><td>Lembaga</td><td>${item.lembaga || '-'}</td></tr>
                                <tr><td>Tautan</td><td>${links}</td></tr>
                            </tbody>
                        </table>`;
                });
            }
            return detailHtml;
        };

        const formatBeritaNegatifDetail = (beritaData) => {
            if (!beritaData || !beritaData.pemberitaan_negatif || normalizeStatus(beritaData.pemberitaan_negatif) === 'tidak ditemukan') return '-';

            let detailHtml = `<p>${beritaData.alasan_pemberitaan_negatif || 'Tidak ada ringkasan.'}</p>`;
            if (beritaData.detail_pemberitaan && beritaData.detail_pemberitaan.length > 0) {
                beritaData.detail_pemberitaan.forEach(item => {
                    const link = item.tautan ? `<a href="${item.tautan}" target="_blank" rel="noopener noreferrer">${item.sumber || 'Sumber'}</a>` : (item.sumber || '-');
                    detailHtml += `
                        <table class="detail-item-table key-value-table">
                            <thead><tr><th>Properti</th><th>Detail</th></tr></thead>
                            <tbody>
                                <tr><td>Kategori</td><td>${item.kategori || '-'}</td></tr>
                                <tr><td>Deskripsi</td><td>${item.deskripsi || '-'}</td></tr>
                                <tr><td>Sumber</td><td>${link}</td></tr>
                            </tbody>
                        </table>`;
                });
            }
            return detailHtml;
        };

        // 1. Memetakan data untuk bagian 'Ringkasan' dan 'Analisis Risiko'
        obj.nama_lengkap = subjectName;
        obj.tanggal_screening = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // [PERUBAHAN] Menggunakan simbol untuk status cepat
        obj.matriks_keputusan_cepat = {
            pep: normalizeStatus(rawData.pep_status?.pep_status) === 'ditemukan' ? '✅ Ditemukan' : '❌ Tidak Ditemukan',
            hukum: normalizeStatus(rawData.keterlibatan_hukum?.keterlibatan_hukum) === 'ditemukan' ? '✅ Ditemukan' : '❌ Tidak Ditemukan',
            berita_negatif: normalizeStatus(rawData.berita_negatif?.pemberitaan_negatif) === 'ditemukan' ? '✅ Ditemukan' : '❌ Tidak Ditemukan'
        };

        // 2. Memetakan data untuk bagian 'Detail PEP'
        obj.pep_status = rawData.pep_status?.pep_status;
        obj.pep_detail = rawData.pep_status?.alasan_pep;
        obj.raw_data = {
            screening_pep: {
                results: rawData.pep_status?.results || [{}],
                notes_limitations: rawData.pep_status?.notes_limitations
            }
        };

        // 3. Memetakan data untuk bagian 'Detail Keterlibatan Hukum'
        obj.keterlibatan_hukum_status = rawData.keterlibatan_hukum?.keterlibatan_hukum;
        obj.keterlibatan_hukum_detail = formatHukumDetail(rawData.keterlibatan_hukum);

        // 4. Memetakan data untuk bagian 'Detail Pemberitaan Negatif'
        obj.pemberitaan_negatif_status = rawData.berita_negatif?.pemberitaan_negatif;
        obj.pemberitaan_negatif_detail = formatBeritaNegatifDetail(rawData.berita_negatif);
        // --- AKHIR BLOK TRANSFORMASI DATA ---


        // Konfigurasi Tabel (Tidak perlu diubah)
        const tableConfigs = [
            {
                title: 'Ringkasan Hasil Screening',
                fields: {
                    'nama_lengkap': 'Nama Lengkap',
                    'tanggal_screening': 'Tanggal Screening',
                    'matriks_keputusan_cepat.pep': 'Status PEP',
                    'matriks_keputusan_cepat.hukum': 'Keterlibatan Hukum',
                    'matriks_keputusan_cepat.berita_negatif': 'Berita Negatif'
                }
            },
            {
                title: 'Detail PEP (Politically Exposed Person)',
                statusPath: 'pep_status',
                fields: {
                    'pep_status': 'Status PEP',
                    'pep_detail': 'Ringkasan/Alasan PEP',
                    'raw_data.screening_pep.results.0.pep_status.category': 'Kategori PEP',
                    'raw_data.screening_pep.results.0.positions': 'Jabatan/Posisi Teridentifikasi',
                    'raw_data.screening_pep.notes_limitations': 'Catatan & Keterbatasan'
                }
            },
            {
                title: 'Detail Keterlibatan Hukum',
                statusPath: 'keterlibatan_hukum_status',
                fields: {
                    'keterlibatan_hukum_status': 'Status Hukum',
                    'keterlibatan_hukum_detail': 'Ringkasan/Detail Hukum'
                }
            },
            {
                title: 'Detail Pemberitaan Negatif',
                statusPath: 'pemberitaan_negatif_status',
                fields: {
                    'pemberitaan_negatif_status': 'Status Pemberitaan Negatif',
                    'pemberitaan_negatif_detail': 'Ringkasan/Detail Berita'
                }
            },
            {
                title: 'Detail Screening KTP',
                statusPath: 'pemberitaan_negatif_status',
                fields: {
                    'status_keaslian_ktp': 'Status Keaslian',
                    'alasan_validasi_ktp': 'Ringkasan/Detail Berita',
                    'analisa_kualitas_dokumen_ktp': 'analisis kualitas (resolusi, warna, OCR, dll)'
                }
            },
        ];

        let html = '';
        tableConfigs.forEach(config => {
            html += `<h3>${config.title}</h3><table class="result-table"><tbody>`;
            const sectionStatusValue = config.statusPath ? getNestedValue(obj, config.statusPath) : 'ditemukan';
            const isSectionFound = normalizeStatus(sectionStatusValue) === 'ditemukan';

            for (const key in config.fields) {
                const label = config.fields[key];
                let value = getNestedValue(obj, key);

                if (!isSectionFound && key !== config.statusPath) {
                    value = null;
                }

                let formattedValue = '';
                if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                    formattedValue = '-';
                } else if (Array.isArray(value)) {
                     if (value.length === 1 && value[0] === '-') {
                         formattedValue = '-';
                     } else {
                        formattedValue = `<ul class="details-list"><li>${value.join('</li><li>')}</li></ul>`;
                     }
                } else if (typeof value === 'object' && value !== null) {
                    if (key === 'raw_data.screening_pep.results.0.positions') {
                        formattedValue = '<div class="positions-detail">';
                        
                        const current = value.current_or_recent || [];
                        formattedValue += '<strong>Current or Recent:</strong>';
                        if (current.length > 0) {
                            formattedValue += `<ul class="details-list"><li>${current.join('</li><li>')}</li></ul>`;
                        } else {
                            formattedValue += ' -<br>';
                        }

                        const historical = value.historical || [];
                        formattedValue += '<strong>Historical:</strong>';
                        if (historical.length > 0) {
                            formattedValue += `<ul class="details-list"><li>${historical.join('</li><li>')}</li></ul>`;
                        } else {
                            formattedValue += ' -';
                        }

                        formattedValue += '</div>';
                    } else {
                        formattedValue = '<div class="details-object">';
                        for (const itemKey in value) {
                            let subValue = value[itemKey];
                            if (Array.isArray(subValue)) {
                                subValue = subValue.join(', ');
                            }
                            formattedValue += `<div><strong>${itemKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${subValue}</div>`;
                        }
                        formattedValue += '</div>';
                    }
                } else {
                    formattedValue = value;
                }
                html += `<tr><td>${label}</td><td>${formattedValue}</td></tr>`;
            }
            html += '</tbody></table>';
        });

        resultDiv.innerHTML = html;
        resultDiv.style.display = 'block';
    }

    /**
     * Helper untuk ambil nested value dengan dot-notation. (Tidak perlu diubah)
     */
    function getNestedValue(obj, path) {
        if (!path) return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }




    /**
     * Menangani proses submit form, memanggil API, dan menampilkan hasilnya.
     */
    async function handleFormSubmit(e) {
    e.preventDefault();
    resetResultDisplay();
    loadingDiv.style.display = 'block';
    submitBtn.disabled = true;

    // Use FormData instead of URLSearchParams
    const formData = new FormData();
    const BASE_API_URL = 'http://10.63.144.146:5678/webhook-test/sbp';
    let API_URL = '';

    if (btnPerorangan.classList.contains('active')) {
        const namaLengkap = document.getElementById('namaPerorangan').value.trim();
        const ktpFileInput = document.querySelector('#ktpPeroranganUpload_input');

        if (!namaLengkap) {
            showError("Nama lengkap wajib diisi.");
            return;
        }
        formData.append('nama_lengkap', namaLengkap);

        // attach file if available
        if (ktpFileInput?.files[0]) {
            formData.append('ktp_file', ktpFileInput.files[0]);
        }

        API_URL = `${BASE_API_URL}/perorangan`;

    } else if (btnBadanUsaha.classList.contains('active')) {
        const namaUsaha = document.getElementById('namaUsaha').value.trim();
        const lamaUsaha = document.getElementById('lamaUsaha').value.trim();
        const namaPemilik = [...document.querySelectorAll('input[name="namaPemilik[]"]')]
            .map(el => el.value.trim()).filter(Boolean);
        const ktpFileInput = document.querySelector('#ktpBadanUsahaUpload_input');

        if (!namaUsaha || !lamaUsaha || namaPemilik.length === 0) {
            showError("Nama Usaha, Lama Usaha, dan minimal satu Nama Pemilik wajib diisi.");
            return;
        }

        formData.append('nama_usaha', namaUsaha);
        formData.append('lama_usaha', lamaUsaha);
        namaPemilik.forEach(pemilik => formData.append('nama_pemilik[]', pemilik));

        if (ktpFileInput?.files[0]) {
            formData.append('ktp_file', ktpFileInput.files[0]);
        }

        API_URL = `${BASE_API_URL}/badan-usaha`;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        renderResults(data);
    } catch (err) {
        console.error(err);
        showError(`Gagal memproses data: ${err.message}`);
    } finally {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
    }
}


    // =================================================================================
    // F. INISIALISASI & EVENT LISTENERS
    // =================================================================================

    // Event listener untuk tab
    btnPerorangan.addEventListener("click", () => {
        resetTabs();
        btnPerorangan.classList.add("active");
        formPerorangan.classList.remove("hidden");
        toggleInputs(formPerorangan, true);
        toggleInputs(formBadanUsaha, false);
        resetFormPerorangan();
        resetResultDisplay();
    });

    btnBadanUsaha.addEventListener("click", () => {
        resetTabs();
        btnBadanUsaha.classList.add("active");
        formBadanUsaha.classList.remove("hidden");
        toggleInputs(formBadanUsaha, true);
        toggleInputs(formPerorangan, false);
        resetFormBadanUsaha();
        resetResultDisplay();
    });

    tambahPemilikBtn.addEventListener("click", tambahPemilik);

    // Event listener untuk autocomplete subsektor
    subsektorInput.addEventListener('focus', () => showDropdownOptions(''));
    subsektorInput.addEventListener('input', (e) => showDropdownOptions(e.target.value));
    subsektorInput.addEventListener('blur', () => setTimeout(() => subsektorList.style.display = 'none', 200));
    subsektorInput.addEventListener('keydown', (e) => {
        const items = subsektorList.querySelectorAll('.dropdown-item');
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocusIndex = (currentFocusIndex + 1) % items.length;
            updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
            updateHighlight(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocusIndex > -1) {
                selectSubsektor(items[currentFocusIndex].textContent);
            }
        }
    });

    // Event listener untuk dropdown wilayah
    provinsiSelect.addEventListener('change', async function() {
        resetSelect(kotaSelect, 'Pilih Kota/Kabupaten');
        resetSelect(kecamatanSelect, 'Pilih Kecamatan');
        resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa');
        if (this.value) {
            kotaSelect.innerHTML = `<option class="loading-option">Memuat...</option>`;
            const regencies = await fetchData(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${this.value}.json`);
            populateSelect(kotaSelect, regencies, 'id', 'name', 'Pilih Kota/Kabupaten');
        }
    });

    kotaSelect.addEventListener('change', async function() {
        resetSelect(kecamatanSelect, 'Pilih Kecamatan');
        resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa');
        if (this.value) {
            kecamatanSelect.innerHTML = `<option class="loading-option">Memuat...</option>`;
            const districts = await fetchData(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${this.value}.json`);
            populateSelect(kecamatanSelect, districts, 'id', 'name', 'Pilih Kecamatan');
        }
    });

    kecamatanSelect.addEventListener('change', async function() {
        resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa');
        if (this.value) {
            kelurahanSelect.innerHTML = `<option class="loading-option">Memuat...</option>`;
            const villages = await fetchData(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${this.value}.json`);
            populateSelect(kelurahanSelect, villages, 'id', 'name', 'Pilih Kelurahan/Desa');
        }
    });

    // Event listener utama untuk submit form
    creditForm.addEventListener('submit', handleFormSubmit);

    // Fungsi inisialisasi saat halaman pertama kali dimuat
    (async function initialize() {
        const provinces = await fetchData(`https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json`);
        populateSelect(provinsiSelect, provinces, 'id', 'name', 'Pilih Provinsi');

        toggleInputs(formPerorangan, true);
        toggleInputs(formBadanUsaha, false);

        resetFormPerorangan();
        inputPerorangan.focus();
    })();
});