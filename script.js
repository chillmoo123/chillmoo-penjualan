/* ==================================
   GOOGLE APPS SCRIPT
================================== */

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbwN1MNAlyJKxGZ0dNYitSx25C8ekEMdIN4h2ntBqio_f2G_olUJvhUNDXxUNJlw9pnSLg/exec";


/* ==================================
   HARGA
================================== */

const HARGA_BESAR = 5000;
const HARGA_KECIL = 3000;


/* ==================================
   ELEMENT
================================== */

const form =
    document.getElementById("formPenjualan");

const noPesanan =
    document.getElementById("noPesanan");

const tanggal =
    document.getElementById("tanggal");

const coneBesar =
    document.getElementById("coneBesar");

const coneKecil =
    document.getElementById("coneKecil");

const previewTotal =
    document.getElementById("previewTotal");

const previewHarga =
    document.getElementById("previewHarga");

const dataPenjualan =
    document.getElementById("dataPenjualan");

const totalSemuaPesanan =
    document.getElementById("totalSemuaPesanan");

const totalSemuaPenjualan =
    document.getElementById("totalSemuaPenjualan");

const btnSimpan =
    document.getElementById("btnSimpan");


/* ==================================
   FORMAT RUPIAH
================================== */

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(angka);

}


/* ==================================
   HITUNG PREVIEW
================================== */

function hitungPreview() {

    const besar =
        Number(coneBesar.value) || 0;

    const kecil =
        Number(coneKecil.value) || 0;


    const total =
        besar + kecil;


    const harga =
        (besar * HARGA_BESAR) +
        (kecil * HARGA_KECIL);


    previewTotal.textContent =
        total;


    previewHarga.textContent =
        formatRupiah(harga);

}


/* ==================================
   EVENT INPUT
================================== */

coneBesar.addEventListener(
    "input",
    hitungPreview
);


coneKecil.addEventListener(
    "input",
    hitungPreview
);


/* ==================================
   TANGGAL OTOMATIS
================================== */

function setTanggalHariIni() {

    const sekarang =
        new Date();

    const tahun =
        sekarang.getFullYear();

    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(2, "0");

    const hari =
        String(
            sekarang.getDate()
        ).padStart(2, "0");


    tanggal.value =
        `${tahun}-${bulan}-${hari}`;

}


setTanggalHariIni();


/* ==================================
   LOAD DATA GOOGLE SHEETS
================================== */

function loadData() {

    dataPenjualan.innerHTML = `
        <tr>
            <td colspan="7">
                Memuat data...
            </td>
        </tr>
    `;


    const callbackName =
        "googleSheetCallback_" +
        Date.now();


    window[callbackName] =
        function(response) {

            if (!response.success) {

                tampilkanError(
                    "Gagal mengambil data"
                );

                return;
            }


            tampilkanData(
                response.data
            );

          if (response.nomorBerikutnya) {

    noPesanan.value =
        response.nomorBerikutnya;

          }
          
          tampilkanRekap(
            response.rekapHariIni,
            response.rekapBulanIni,
            response.rekapBulanan
          );


            delete window[
                callbackName
            ];

        };


    const script =
        document.createElement("script");


    script.src =
        URL_APPS_SCRIPT +
        "?callback=" +
        callbackName;


    script.onerror =
        function() {

            tampilkanError(
                "Tidak dapat terhubung ke Google Sheets"
            );

            delete window[
                callbackName
            ];

        };


    document.body.appendChild(script);

}


/* ==================================
   TAMPILKAN DATA
================================== */

function tampilkanData(data) {

    if (!data || data.length === 0) {

        dataPenjualan.innerHTML = `
            <tr>
                <td colspan="7">
                    Belum ada data penjualan
                </td>
            </tr>
        `;

        totalSemuaPesanan.textContent =
            "0";

        totalSemuaPenjualan.textContent =
            "Rp 0";

        return;
    }


    let totalPesananSemua = 0;

    let totalPenjualanSemua = 0;


    dataPenjualan.innerHTML = "";


    data.forEach(item => {

        const totalPesanan =
            Number(item.totalPesanan) || 0;

        const totalHarga =
            Number(item.totalHarga) || 0;

        const totalPenjualan =
            Number(item.totalPenjualan) || 0;


        totalPesananSemua +=
            totalPesanan;


        totalPenjualanSemua =
            totalPenjualan;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.noPesanan}
            </td>

            <td>
                ${formatTanggal(item.tanggal)}
            </td>

            <td>
                ${item.coneBesar}
            </td>

            <td>
                ${item.coneKecil}
            </td>

            <td>
                ${totalPesanan}
            </td>

            <td>
                ${formatRupiah(totalHarga)}
            </td>

            <td>
                ${formatRupiah(totalPenjualan)}
            </td>

        `;


        dataPenjualan.appendChild(row);

    });


    totalSemuaPesanan.textContent =
        totalPesananSemua;


    totalSemuaPenjualan.textContent =
        formatRupiah(totalPenjualanSemua);

}


/* ==================================
   FORMAT TANGGAL
================================== */

function formatTanggal(tanggalData) {

    if (!tanggalData) {
        return "-";
    }


    const tanggal =
        new Date(tanggalData);


    if (isNaN(tanggal)) {
        return tanggalData;
    }


    return tanggal.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ==================================
   SIMPAN PENJUALAN
================================== */

form.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const besar =
            Number(coneBesar.value) || 0;

        const kecil =
            Number(coneKecil.value) || 0;


        const totalPesanan =
            besar + kecil;


        const totalHarga =
            (besar * HARGA_BESAR) +
            (kecil * HARGA_KECIL);


        if (totalPesanan <= 0) {

            alert(
                "Masukkan jumlah pesanan terlebih dahulu."
            );

            return;
        }


        btnSimpan.disabled = true;

        btnSimpan.textContent =
            "Menyimpan...";


        const data = {

            noPesanan:
                noPesanan.value.trim(),

            tanggal:
                tanggal.value,

            coneBesar:
                besar,

            coneKecil:
                kecil,

            totalPesanan:
                totalPesanan,

            totalHarga:
                totalHarga

        };


        fetch(
            URL_APPS_SCRIPT,
            {
                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(data)

            }
        )
        .then(() => {

            tampilkanToast(
                "Penjualan berhasil disimpan!"
            );


            form.reset();


            coneBesar.value =
                0;

            coneKecil.value =
                0;


            setTanggalHariIni();


            hitungPreview();


            setTimeout(
                loadData,
                1000
            );

        })
        .catch(error => {

            console.error(error);

            alert(
                "Terjadi kesalahan saat menyimpan data."
            );

        })
        .finally(() => {

            btnSimpan.disabled =
                false;

            btnSimpan.textContent =
                "Simpan Penjualan";

        });

    }
);


/* ==================================
   TOAST
================================== */

function tampilkanToast(pesan) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        pesan;


    toast.classList.add("show");


    setTimeout(
        () => {
            toast.classList.remove("show");
        },
        2500
    );

}


/* ==================================
   ERROR
================================== */

function tampilkanError(pesan) {

    dataPenjualan.innerHTML = `

        <tr>

            <td colspan="7">

                ${pesan}

            </td>

        </tr>

    `;

}


/* ==================================
   JALANKAN
================================== */

hitungPreview();

loadData();

function tampilkanRekap(
    rekapHariIni,
    rekapBulanIni,
    rekapBulanan
) {

    // =========================
    // REKAP HARIAN
    // =========================

    if (rekapHariIni) {

        const jumlahPesanan =
            Number(rekapHariIni.jumlahPesanan) || 0;

        const coneBesar =
            Number(rekapHariIni.coneBesar) || 0;

        const coneKecil =
            Number(rekapHariIni.coneKecil) || 0;

        const penjualan =
            Number(rekapHariIni.totalPenjualan) || 0;


        document.getElementById(
            "rekapHariIniPesanan"
        ).textContent =
            jumlahPesanan;


        document.getElementById(
            "rekapHariIniCone"
        ).textContent =
            `Besar: ${coneBesar} • Kecil: ${coneKecil}`;


        document.getElementById(
            "rekapHariIniPenjualan"
        ).textContent =
            formatRupiah(penjualan);

    }


     // =========================
    // REKAP BULANAN
    // =========================

    const tabel =
        document.getElementById(
            "dataRekapBulanan"
        );


    if (!tabel) {
        return;
    }


    if (
        !rekapBulanan ||
        rekapBulanan.length === 0
    ) {

        tabel.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada rekap bulanan
                </td>
            </tr>
        `;

        return;
    }


    tabel.innerHTML = "";


    rekapBulanan.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.bulan}
            </td>

            <td>
                ${Number(item.jumlahPesanan) || 0}
            </td>

            <td>
                ${Number(item.coneBesar) || 0}
            </td>

            <td>
                ${Number(item.coneKecil) || 0}
            </td>

            <td>
                ${Number(item.totalPesanan) || 0}
            </td>

            <td>
                ${formatRupiah(
                    Number(item.totalPenjualan) || 0
                )}
            </td>

        `;


        tabel.appendChild(row);

    });

}

function tampilkanRekap(
    rekapHariIni,
    rekapBulanIni,
    rekapBulanan
) {

    // REKAP HARI INI
    if (rekapHariIni) {

        const jumlahPesanan =
            Number(rekapHariIni.jumlahPesanan) || 0;

        const coneBesar =
            Number(rekapHariIni.coneBesar) || 0;

        const coneKecil =
            Number(rekapHariIni.coneKecil) || 0;

        const penjualan =
            Number(rekapHariIni.totalPenjualan) || 0;

        const elPesanan =
            document.getElementById(
                "rekapHariIniPesanan"
            );

        const elCone =
            document.getElementById(
                "rekapHariIniCone"
            );

        const elPenjualan =
            document.getElementById(
                "rekapHariIniPenjualan"
            );

        if (elPesanan) {
            elPesanan.textContent =
                jumlahPesanan;
        }

        if (elCone) {
            elCone.textContent =
                `Besar: ${coneBesar} • Kecil: ${coneKecil}`;
        }

        if (elPenjualan) {
            elPenjualan.textContent =
                formatRupiah(penjualan);
        }
    }


    // REKAP BULANAN
    const tabel =
        document.getElementById(
            "dataRekapBulanan"
        );

    if (!tabel) {
        return;
    }

    if (
        !rekapBulanan ||
        rekapBulanan.length === 0
    ) {

        tabel.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada rekap bulanan
                </td>
            </tr>
        `;

        return;
    }

    tabel.innerHTML = "";

    rekapBulanan.forEach(item => {

        const row =
            document.createElement("tr");

        let bulan = item.bulan;

        // Jika Google Sheets mengirim tanggal ISO
        if (
    typeof bulan === "string" &&
    bulan.includes("T")
) {

    const tanggal =
        new Date(bulan);

    if (!isNaN(tanggal)) {

        // Kembalikan ke WIB
        const waktuWIB =
            new Date(
                tanggal.getTime() +
                (7 * 60 * 60 * 1000)
            );

        const tahun =
            waktuWIB.getUTCFullYear();

        const nomorBulan =
            waktuWIB.getUTCMonth() + 1;

        bulan =
            `${tahun}-${String(nomorBulan)
                .padStart(2, "0")}`;
    }
        }

        row.innerHTML = `
            <td>${bulan}</td>
            <td>${Number(item.jumlahPesanan) || 0}</td>
            <td>${Number(item.coneBesar) || 0}</td>
            <td>${Number(item.coneKecil) || 0}</td>
            <td>${Number(item.totalPesanan) || 0}</td>
            <td>${formatRupiah(
                Number(item.totalPenjualan) || 0
            )}</td>
        `;

        tabel.appendChild(row);
    });
}    

}
